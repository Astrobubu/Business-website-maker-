#!/usr/bin/env node
require('dotenv').config();
const analyzerService = require('../services/analyzer');
const db = require('../database/db');

// Mock business data for demo
const mockBusinesses = [
  {
    name: "Tony's Pizza Palace",
    industry: "restaurant",
    website_url: null, // No website - perfect target!
    phone: "(305) 555-0123",
    address: "123 Ocean Drive, Miami, FL",
    google_rating: 4.5,
    google_reviews_count: 234
  },
  {
    name: "Sunset Grill & Bar",
    industry: "restaurant",
    website_url: "http://example-old-site.com", // No SSL, likely outdated
    phone: "(305) 555-0456",
    address: "456 Beach Blvd, Miami, FL",
    google_rating: 4.2,
    google_reviews_count: 156
  },
  {
    name: "Miami Sushi House",
    industry: "restaurant",
    website_url: "https://miami-sushi.example.com",
    phone: "(305) 555-0789",
    address: "789 Collins Ave, Miami, FL",
    google_rating: 4.7,
    google_reviews_count: 445
  },
  {
    name: "Bella Pasta Italiano",
    industry: "restaurant",
    website_url: null,
    phone: null, // No phone number listed!
    address: "321 Main St, Miami, FL",
    google_rating: 4.3,
    google_reviews_count: 98
  },
  {
    name: "The Burger Joint",
    industry: "restaurant",
    website_url: "https://facebook.com/burgerjointmiami", // Using Facebook as website
    phone: "(305) 555-0999",
    address: "555 Lincoln Rd, Miami, FL",
    google_rating: 4.6,
    google_reviews_count: 512
  }
];

async function saveMockBusiness(mockData) {
  const result = await db.run(
    `INSERT INTO businesses (
      google_place_id, name, industry, address, phone, website_url,
      latitude, longitude, google_rating, google_reviews_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      `mock_${Math.random().toString(36).substr(2, 9)}`,
      mockData.name,
      mockData.industry,
      mockData.address,
      mockData.phone,
      mockData.website_url,
      25.7617 + (Math.random() - 0.5) * 0.1, // Random Miami coordinates
      -80.1918 + (Math.random() - 0.5) * 0.1,
      mockData.google_rating,
      mockData.google_reviews_count
    ]
  );

  return await db.get('SELECT * FROM businesses WHERE id = ?', [result.id]);
}

async function main() {
  try {
    console.log('🚀 Website Rescue Platform - DEMO MODE\n');
    console.log('📍 Demo Location: Miami, FL');
    console.log('🏢 Demo Industry: Restaurants');
    console.log(`📊 Analyzing ${mockBusinesses.length} businesses\n`);

    // Initialize database
    await db.initialize();

    // Save mock businesses
    console.log('💾 Loading demo businesses...\n');
    const businesses = [];
    for (const mockData of mockBusinesses) {
      const business = await saveMockBusiness(mockData);
      businesses.push(business);
    }

    // Analyze each business (with simulated results)
    console.log('🔬 Analyzing web presence...\n');
    const results = [];

    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];

      console.log(`[${i + 1}/${businesses.length}] ${business.name}`);

      // Create simulated analysis
      const analysis = {
        business_id: business.id,
        health_score: 0,
        has_website: !!business.website_url,
        has_ssl: business.website_url?.startsWith('https://') || false,
        mobile_responsive: false,
        page_load_time: Math.random() * 5,
        has_meta_tags: false,
        has_schema_markup: false,
        has_contact_info: !!business.phone,
        has_hours: false,
        has_cta: false,
        broken_links_count: 0,
        missing_images_count: 0,
        lighthouse_score: 0,
        red_flags: [],
        opportunities: []
      };

      // Generate intelligent red flags and opportunities based on business
      if (!business.website_url) {
        analysis.health_score = 0;
        analysis.red_flags = [
          'No website - invisible to 73% of potential customers',
          'Missing from "restaurants near me" searches',
          'Competitors with websites getting your customers',
          'No way for customers to view menu or hours online'
        ];
        analysis.opportunities = [
          'Create professional website to capture local search traffic',
          'Implement online ordering to increase revenue by 40%',
          'Add Google Maps integration for easy discovery',
          'Enable mobile-friendly menu viewing and reservations'
        ];
      } else if (business.website_url.includes('facebook.com')) {
        analysis.health_score = 25;
        analysis.red_flags = [
          'Using Facebook as primary website (unprofessional)',
          'Losing customers who don\'t use Facebook',
          'No control over your online presence',
          'Poor search engine visibility'
        ];
        analysis.opportunities = [
          'Build dedicated website for credibility and SEO',
          'Integrate social media while maintaining web presence',
          'Add online ordering and reservation system',
          'Improve local search rankings by 60%'
        ];
      } else if (!business.website_url.startsWith('https://')) {
        analysis.health_score = 35;
        analysis.red_flags = [
          'No SSL certificate - browsers show "Not Secure" warning',
          'Likely outdated design hurting credibility',
          'Losing mobile users (60% of traffic)',
          'Poor search engine rankings'
        ];
        analysis.opportunities = [
          'Modern redesign with SSL to regain customer trust',
          'Mobile-responsive design to capture smartphone users',
          'SEO optimization to rank higher in local searches',
          'Add online ordering integration'
        ];
      } else {
        analysis.health_score = 50;
        analysis.has_meta_tags = Math.random() > 0.5;
        analysis.mobile_responsive = Math.random() > 0.3;
        analysis.red_flags = [
          'Missing clear call-to-action buttons',
          'Slow page load times (losing 40% of visitors)',
          'No online ordering integration',
          'Business hours not clearly displayed'
        ];
        analysis.opportunities = [
          'Add "Order Now" and "Reserve Table" buttons',
          'Optimize images and code for faster loading',
          'Implement online ordering system',
          'Add schema markup for rich search results'
        ];
      }

      // Calculate health score
      if (analysis.has_website) analysis.health_score += 20;
      if (analysis.has_ssl) analysis.health_score += 15;
      if (analysis.mobile_responsive) analysis.health_score += 15;
      if (analysis.has_contact_info) analysis.health_score += 10;

      // Save analysis
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

      results.push({
        name: business.name,
        website: business.website_url || 'NONE',
        phone: business.phone || 'NOT LISTED',
        rating: business.google_rating,
        reviews: business.google_reviews_count,
        health_score: analysis.health_score,
        red_flags: analysis.red_flags,
        opportunities: analysis.opportunities
      });

      console.log(`   Health Score: ${analysis.health_score}/100 ${getScoreEmoji(analysis.health_score)}`);
      console.log(`   Website: ${business.website_url || '❌ NONE - Perfect target!'}`);
      console.log('');
    }

    // Display detailed summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 DETAILED ANALYSIS REPORT');
    console.log('='.repeat(80));

    // Sort by health score (lowest first - best opportunities)
    results.sort((a, b) => a.health_score - b.health_score);

    results.forEach((result, index) => {
      const priority = index === 0 ? '🎯 TOP PRIORITY' : index < 3 ? '⭐ HIGH PRIORITY' : '📋 GOOD PROSPECT';

      console.log(`\n${priority} - BUSINESS #${index + 1}`);
      console.log('─'.repeat(80));
      console.log(`Name: ${result.name}`);
      console.log(`Rating: ${result.rating}/5 ⭐ (${result.reviews} reviews)`);
      console.log(`Website: ${result.website}`);
      console.log(`Phone: ${result.phone}`);
      console.log(`Health Score: ${result.health_score}/100 ${getScoreEmoji(result.health_score)}`);

      console.log(`\n🚩 CRITICAL ISSUES (What's costing them customers):`);
      result.red_flags.forEach(flag => console.log(`   • ${flag}`));

      console.log(`\n💰 REVENUE OPPORTUNITIES (How we can help):`);
      result.opportunities.forEach(opp => console.log(`   • ${opp}`));

      console.log(`\n💡 PITCH ANGLE:`);
      if (result.health_score === 0) {
        console.log(`   "We already built you a website. Want to see it? It could be bringing`);
        console.log(`    you 20-30 more customers per month. Here's the demo link..."`);
      } else if (result.health_score < 40) {
        console.log(`   "Your current website is costing you customers. We built a modern`);
        console.log(`    version that could increase your traffic by 50%. Check it out..."`);
      } else {
        console.log(`   "We optimized your website and added online ordering. See the`);
        console.log(`    improvements that could boost your revenue by 25%..."`);
      }

      console.log(`\n📊 ESTIMATED VALUE:`);
      const monthlyValue = estimateMonthlyValue(result.health_score, result.reviews);
      console.log(`   • Potential new customers/month: ${monthlyValue.newCustomers}`);
      console.log(`   • Estimated revenue increase: $${monthlyValue.revenue.toLocaleString()}/month`);
      console.log(`   • Recommended package: ${monthlyValue.package}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Demo analysis complete!\n');

    console.log('🎯 NEXT STEPS:');
    console.log('   1. Generate demo websites for top prospects');
    console.log('   2. Set up automated outreach campaigns');
    console.log('   3. Track demo views and engagement');
    console.log('   4. Convert to paying customers\n');

    // Close database
    await db.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function getScoreEmoji(score) {
  if (score === 0) return '💀 CRITICAL';
  if (score < 30) return '🔴 POOR';
  if (score < 50) return '🟠 NEEDS WORK';
  if (score < 70) return '🟡 AVERAGE';
  if (score < 90) return '🟢 GOOD';
  return '✅ EXCELLENT';
}

function estimateMonthlyValue(healthScore, reviews) {
  const baseTraffic = reviews * 2; // Estimate monthly site visitors
  const missedOpportunity = Math.floor((100 - healthScore) / 100 * baseTraffic);

  let package_type = 'Basic ($299)';
  if (healthScore === 0) {
    package_type = 'Custom ($999)';
  } else if (healthScore < 40) {
    package_type = 'Premium ($2,499)';
  }

  return {
    newCustomers: Math.floor(missedOpportunity * 0.3),
    revenue: Math.floor(missedOpportunity * 0.3 * 35), // $35 avg order
    package: package_type
  };
}

main();
