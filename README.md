# Website Rescue Platform

A hyper-targeted web development lead generation system that identifies businesses with poor web presence, auto-generates improved versions, and demonstrates value before selling.

## 🎯 Core Concept

Instead of saying "we build websites," we say: **"We already built your website. Want to see it?"**

## 🚀 Features

### Discovery & Scraping Layer
- Google Maps API integration for local business discovery
- Web scraping to analyze existing websites
- Social media presence checker (Facebook, Instagram)
- Review platform integration (Yelp, TripAdvisor)

### Analysis Layer (AI-Powered)
- **Red Flags Detection:**
  - No website or poor mobile responsiveness
  - Missing critical info (hours, phone, menu/services)
  - No SSL certificate or slow load times
  - Poor SEO (missing meta tags, schema markup)
  - Outdated design patterns
  - Broken links/images

- **Scoring System:**
  - Web Presence Health Score (0-100)
  - Prioritize businesses with highest improvement potential
  - ROI estimation based on industry and location

### Auto-Generation Layer
- Industry-specific templates (restaurant, salon, plumber, etc.)
- Auto-populate from scraped data
- AI-generated copy using GPT-4
- Stock photos relevant to industry
- Mobile-responsive design
- Instant deployment

### Delivery & Sales System
- One-click demo sites: `businessname-demo.yourplatform.com`
- Time-limited demos (7-day expiry)
- Before/after comparison
- Missed opportunities report
- Automated outreach (email, SMS, physical mailers)

## 💰 Monetization Strategy

### Tiered Pricing
- **Basic ($299)**: Deploy generated site as-is
- **Custom ($999)**: Modifications + 3 months hosting
- **Premium ($2,499)**: Full custom design + SEO + maintenance
- **Subscription ($99/mo)**: Hosting + updates + local SEO

### Value-Added Services
- Google My Business optimization
- Review management system
- Social media setup
- Local SEO package
- Email marketing setup

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (easy to upgrade to PostgreSQL)
- **Scraping**: Puppeteer + Cheerio
- **AI**: OpenAI GPT-4
- **Templates**: EJS
- **Analysis**: Lighthouse (performance auditing)
- **APIs**: Google Maps, Twilio (SMS), Nodemailer (Email)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd website-rescue-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Initialize the database:
```bash
npm run init-db
```

5. Start the server:
```bash
npm run dev
```

## 🎮 Usage

### Discovery Mode
Find businesses in a specific area:
```bash
npm run discover -- --location "New York, NY" --radius 5 --industry restaurant
```

### Analysis Mode
Analyze a specific business:
```bash
npm run analyze -- --business-id 12345
```

### Generation Mode
Generate a demo website:
```bash
npm run generate -- --business-id 12345
```

### Outreach Mode
Send automated outreach:
```bash
npm run outreach -- --business-id 12345 --method email
```

## 📊 API Endpoints

### Discovery
- `POST /api/discover` - Search for businesses
- `GET /api/businesses` - List discovered businesses
- `GET /api/businesses/:id` - Get business details

### Analysis
- `POST /api/analyze/:id` - Analyze business web presence
- `GET /api/analysis/:id` - Get analysis results

### Generation
- `POST /api/generate/:id` - Generate demo website
- `GET /api/demos/:id` - View demo website

### Outreach
- `POST /api/outreach/:id` - Send outreach campaign

## 🎨 Template System

Templates are organized by industry:
```
templates/
├── restaurant/
├── salon/
├── plumber/
├── lawyer/
├── dentist/
└── default/
```

Each template includes:
- `index.ejs` - Main template
- `style.css` - Styling
- `config.json` - Template configuration

## 📈 Implementation Phases

### Phase 1: MVP (Current)
- [x] Manual/semi-automated discovery
- [x] Basic template system
- [x] Focus on restaurants
- [x] Manual outreach

### Phase 2: Scale
- [ ] Fully automated discovery
- [ ] Multiple industries
- [ ] Automated outreach sequences
- [ ] A/B test messaging

### Phase 3: Platform
- [ ] Self-serve portal
- [ ] White-label for agencies
- [ ] API for partners
- [ ] Franchise model

## ⚠️ Legal Considerations

- Respect robots.txt and website scraping policies
- Comply with CAN-SPAM Act for email outreach
- Follow TCPA guidelines for SMS marketing
- Use data ethically and transparently

## 🤝 Contributing

This is a proprietary business model. Contact the owner for collaboration opportunities.

## 📄 License

MIT License - See LICENSE file for details

## 🔮 Roadmap

- [ ] Competitive intelligence dashboard
- [ ] ROI calculator
- [ ] White-label partner program
- [ ] Mobile app for field sales
- [ ] Integration with CRM systems
- [ ] Automated SEO auditing
- [ ] Social media content generator

## 📞 Support

For issues or questions, please open a GitHub issue or contact support.

---

**Built with ❤️ to help local businesses thrive online**
