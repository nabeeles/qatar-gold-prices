const { getActiveProviders, savePrices } = require('./utils/db');
const { scrapeWithPuppeteer } = require('./strategies/puppeteer');
const { scrapeWithCheerio } = require('./strategies/cheerio');

async function runScraper() {
  console.log('--- Starting Qatar Gold Price Scraper ---');
  console.log(`Time: ${new Date().toISOString()}`);

  try {
    const providers = await getActiveProviders();
    console.log(`Found ${providers.length} active providers.`);

    for (const provider of providers) {
      let prices = null;

      try {
        if (provider.scraping_type === 'direct') {
          prices = await scrapeWithPuppeteer(provider);
        } else if (provider.scraping_type === 'aggregator') {
          prices = await scrapeWithCheerio(provider);
        }

        if (prices && (prices['24k'] || prices['22k'])) {
          console.log(`✅ Extracted prices for ${provider.name}:`, prices);
          await savePrices(provider.id, prices);
          console.log(`💾 Saved to database.`);
        } else {
          console.warn(`⚠️  No prices found for ${provider.name}.`);
        }
      } catch (err) {
        console.error(`❌ Failed to process ${provider.name}:`, err.message);
      }
    }

    console.log('--- Scraper Run Finished ---');
  } catch (error) {
    console.error('CRITICAL ERROR:', error.message);
    process.exit(1);
  }
}

// Run the scraper
runScraper();
