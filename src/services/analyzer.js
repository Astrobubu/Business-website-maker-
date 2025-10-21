const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../database/db');

class AnalyzerService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  /**
   * Analyze a business's web presence
   */
  async analyzeBusiness(businessId) {
    try {
      const business = await db.get('SELECT * FROM businesses WHERE id = ?', [businessId]);

      if (!business) {
        throw new Error('Business not found');
      }

      console.log(`\n🔍 Analyzing: ${business.name}`);

      const analysis = {
        business_id: businessId,
        health_score: 0,
        has_website: !!business.website_url,
        has_ssl: false,
        mobile_responsive: false,
        page_load_time: 0,
        has_meta_tags: false,
        has_schema_markup: false,
        has_contact_info: false,
        has_hours: false,
        has_cta: false,
        broken_links_count: 0,
        missing_images_count: 0,
        lighthouse_score: 0,
        red_flags: [],
        opportunities: []
      };

      // If no website, calculate score and return
      if (!business.website_url) {
        analysis.health_score = 0;
        analysis.red_flags = [
          'No website found',
          'Missing from online searches',
          'Losing customers to competitors'
        ];
        analysis.opportunities = [
          'Create professional website',
          'Establish online presence',
          'Capture local search traffic',
          'Enable online customer engagement'
        ];

        await this.saveAnalysis(analysis);
        return analysis;
      }

      // Scrape and analyze website
      const websiteData = await this.scrapeWebsite(business.website_url);

      // Check SSL
      analysis.has_ssl = business.website_url.startsWith('https://');

      // Check meta tags
      analysis.has_meta_tags = !!(websiteData.title && websiteData.description);

      // Check contact info
      analysis.has_contact_info = !!(
        websiteData.hasPhone ||
        websiteData.hasEmail ||
        websiteData.hasAddress
      );

      // Check CTA
      analysis.has_cta = websiteData.hasCTA;

      // Check hours
      analysis.has_hours = websiteData.hasHours;

      // Check schema markup
      analysis.has_schema_markup = websiteData.hasSchema;

      // Mobile responsive check (basic)
      analysis.mobile_responsive = websiteData.hasViewport;

      // Page load time simulation
      analysis.page_load_time = websiteData.loadTime;

      // Count issues
      analysis.broken_links_count = websiteData.brokenLinks || 0;
      analysis.missing_images_count = websiteData.missingImages || 0;

      // Use Gemini AI to analyze the website content
      const aiAnalysis = await this.analyzeWithGemini(business, websiteData);
      analysis.red_flags = aiAnalysis.red_flags;
      analysis.opportunities = aiAnalysis.opportunities;

      // Calculate health score
      analysis.health_score = this.calculateHealthScore(analysis);

      // Save analysis to database
      await this.saveAnalysis(analysis);

      return analysis;

    } catch (error) {
      console.error('Analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Scrape website and extract key information
   */
  async scrapeWebsite(url) {
    const startTime = Date.now();

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const loadTime = (Date.now() - startTime) / 1000;
      const $ = cheerio.load(response.data);
      const html = response.data.toLowerCase();

      return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        hasPhone: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(html) ||
                  $('a[href^="tel:"]').length > 0,
        hasEmail: /@/.test(html) || $('a[href^="mailto:"]').length > 0,
        hasAddress: /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)/i.test(html),
        hasCTA: $('button, a.btn, .cta, [class*="button"]').length > 0,
        hasHours: /hours|open|close|monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(html),
        hasSchema: $('script[type="application/ld+json"]').length > 0,
        hasViewport: $('meta[name="viewport"]').length > 0,
        loadTime: loadTime,
        wordCount: $('body').text().split(/\s+/).length,
        imageCount: $('img').length,
        linkCount: $('a').length,
        h1Count: $('h1').length,
        htmlContent: $('body').text().substring(0, 5000), // First 5000 chars for AI analysis
        brokenLinks: 0, // Would need deeper analysis
        missingImages: $('img:not([src])').length
      };

    } catch (error) {
      console.error('Scraping error:', error.message);
      return {
        title: null,
        description: null,
        hasPhone: false,
        hasEmail: false,
        hasAddress: false,
        hasCTA: false,
        hasHours: false,
        hasSchema: false,
        hasViewport: false,
        loadTime: 0,
        wordCount: 0,
        imageCount: 0,
        linkCount: 0,
        h1Count: 0,
        htmlContent: '',
        brokenLinks: 0,
        missingImages: 0
      };
    }
  }

  /**
   * Use Gemini AI to analyze website content
   */
  async analyzeWithGemini(business, websiteData) {
    try {
      const prompt = `You are a web presence analyst for local businesses. Analyze this business and their website.

Business Information:
- Name: ${business.name}
- Industry: ${business.industry}
- Has Website: ${business.website_url ? 'Yes' : 'No'}
- Rating: ${business.google_rating}/5 (${business.google_reviews_count} reviews)

Website Analysis:
- Has SSL: ${business.website_url?.startsWith('https://') ? 'Yes' : 'No'}
- Page Load Time: ${websiteData.loadTime}s
- Mobile Responsive: ${websiteData.hasViewport ? 'Yes' : 'No'}
- Contact Info Present: ${websiteData.hasPhone || websiteData.hasEmail ? 'Yes' : 'No'}
- Call-to-Action: ${websiteData.hasCTA ? 'Yes' : 'No'}
- Business Hours: ${websiteData.hasHours ? 'Yes' : 'No'}
- SEO Meta Tags: ${websiteData.title && websiteData.description ? 'Yes' : 'No'}
- Schema Markup: ${websiteData.hasSchema ? 'Yes' : 'No'}

Website Content Sample:
${websiteData.htmlContent ? websiteData.htmlContent.substring(0, 1000) : 'No content available'}

Based on this analysis, provide:
1. A list of 3-5 critical RED FLAGS (problems that are losing them customers)
2. A list of 3-5 HIGH-VALUE OPPORTUNITIES (improvements that will drive revenue)

Format your response as JSON:
{
  "red_flags": ["flag 1", "flag 2", ...],
  "opportunities": ["opportunity 1", "opportunity 2", ...]
}

Be specific, actionable, and focus on business impact (lost revenue, missed customers, competitive disadvantage).`;

      const response = await axios.post(
        `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const text = response.data.candidates[0].content.parts[0].text;

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = text;
      if (text.includes('```json')) {
        jsonText = text.split('```json')[1].split('```')[0].trim();
      } else if (text.includes('```')) {
        jsonText = text.split('```')[1].split('```')[0].trim();
      }

      const analysis = JSON.parse(jsonText);
      return analysis;

    } catch (error) {
      console.error('Gemini analysis error:', error.message);

      // Fallback analysis
      return {
        red_flags: [
          'Unable to perform AI analysis',
          'Website may have accessibility issues',
          'Potential SEO problems'
        ],
        opportunities: [
          'Comprehensive website audit needed',
          'Modern redesign recommended',
          'Mobile optimization required'
        ]
      };
    }
  }

  /**
   * Calculate overall health score (0-100)
   */
  calculateHealthScore(analysis) {
    let score = 0;

    // Website exists: 20 points
    if (analysis.has_website) score += 20;

    // SSL: 10 points
    if (analysis.has_ssl) score += 10;

    // Mobile responsive: 15 points
    if (analysis.mobile_responsive) score += 15;

    // Meta tags: 10 points
    if (analysis.has_meta_tags) score += 10;

    // Schema markup: 10 points
    if (analysis.has_schema_markup) score += 10;

    // Contact info: 15 points
    if (analysis.has_contact_info) score += 15;

    // Business hours: 10 points
    if (analysis.has_hours) score += 10;

    // Call to action: 10 points
    if (analysis.has_cta) score += 10;

    // Deduct for slow load time
    if (analysis.page_load_time > 3) score -= 5;
    if (analysis.page_load_time > 5) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Save analysis to database
   */
  async saveAnalysis(analysis) {
    try {
      await db.run(
        `INSERT INTO analysis_results (
          business_id, health_score, has_website, has_ssl, mobile_responsive,
          page_load_time, has_meta_tags, has_schema_markup, has_contact_info,
          has_hours, has_cta, broken_links_count, missing_images_count,
          lighthouse_score, red_flags, opportunities
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          analysis.business_id,
          analysis.health_score,
          analysis.has_website ? 1 : 0,
          analysis.has_ssl ? 1 : 0,
          analysis.mobile_responsive ? 1 : 0,
          analysis.page_load_time,
          analysis.has_meta_tags ? 1 : 0,
          analysis.has_schema_markup ? 1 : 0,
          analysis.has_contact_info ? 1 : 0,
          analysis.has_hours ? 1 : 0,
          analysis.has_cta ? 1 : 0,
          analysis.broken_links_count,
          analysis.missing_images_count,
          analysis.lighthouse_score,
          JSON.stringify(analysis.red_flags),
          JSON.stringify(analysis.opportunities)
        ]
      );
    } catch (error) {
      console.error('Error saving analysis:', error.message);
      throw error;
    }
  }

  /**
   * Get analysis for a business
   */
  async getAnalysis(businessId) {
    const result = await db.get(
      'SELECT * FROM analysis_results WHERE business_id = ? ORDER BY analyzed_at DESC LIMIT 1',
      [businessId]
    );

    if (result) {
      result.red_flags = JSON.parse(result.red_flags);
      result.opportunities = JSON.parse(result.opportunities);
    }

    return result;
  }
}

module.exports = new AnalyzerService();
