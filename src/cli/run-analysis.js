#!/usr/bin/env node
require('dotenv').config();
const discoveryService = require('../services/discovery');
const analyzerService = require('../services/analyzer');
const db = require('../database/db');

async function main() {
  try {
    console.log('🚀 Website Rescue Platform - Discovery & Analysis\n');

    // Get command line arguments
    const args = process.argv.slice(2);
    const location = args[0] || 'Miami, FL';
    const industry = args[1] || 'restaurant';
    const limit = parseInt(args[2]) || 10;

    console.log(`📍 Location: ${location}`);
    console.log(`🏢 Industry: ${industry}`);
    console.log(`📊 Limit: ${limit} businesses\n`);

    // Initialize database
    await db.initialize();

    // Step 1: Discover businesses
    console.log('🔍 Step 1: Discovering businesses...\n');
    const discovery = await discoveryService.discoverBusinesses({
      location,
      radius: 5,
      industry,
      limit
    });

    console.log(`✅ Found ${discovery.count} businesses\n`);

    // Step 2: Analyze each business
    console.log('🔬 Step 2: Analyzing web presence...\n');

    const results = [];

    for (let i = 0; i < discovery.businesses.length; i++) {
      const business = discovery.businesses[i];

      console.log(`[${i + 1}/${discovery.businesses.length}] ${business.name}`);

      try {
        const analysis = await analyzerService.analyzeBusiness(business.id);

        results.push({
          name: business.name,
          website: business.website_url || 'None',
          health_score: analysis.health_score,
          red_flags: analysis.red_flags,
          opportunities: analysis.opportunities
        });

        console.log(`   Health Score: ${analysis.health_score}/100`);
        console.log(`   Website: ${business.website_url || 'NONE - Perfect target!'}`);
        console.log('');

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Step 3: Display summary
    console.log('\n📊 ANALYSIS SUMMARY\n');
    console.log('=' .repeat(80));

    // Sort by health score (lowest first - best opportunities)
    results.sort((a, b) => a.health_score - b.health_score);

    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}`);
      console.log(`   Health Score: ${result.health_score}/100`);
      console.log(`   Website: ${result.website}`);

      console.log(`\n   🚩 RED FLAGS:`);
      result.red_flags.forEach(flag => console.log(`      • ${flag}`));

      console.log(`\n   💡 OPPORTUNITIES:`);
      result.opportunities.forEach(opp => console.log(`      • ${opp}`));

      console.log('\n   ' + '-'.repeat(76));
    });

    console.log('\n✅ Analysis complete!\n');

    // Close database
    await db.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
