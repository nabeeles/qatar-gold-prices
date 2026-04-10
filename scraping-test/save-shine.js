const { getActiveProviders, savePrices } = require('../backend/scraper/utils/db');
const { scrapeWithPuppeteer } = require('../backend/scraper/strategies/puppeteer');

async function saveShine() {
  console.log('--- Manual Scrape and Save (Shine Jewelers) ---\n');
  
  try {
    const providers = await getActiveProviders();
    const shine = providers.find(p => p.name.includes('Shine'));
    
    if (!shine) {
      console.error('❌ Shine Jewelers provider not found in database.');
      return;
    }

    console.log(`Scraping ${shine.name}...`);
    const prices = await scrapeWithPuppeteer(shine);

    if (prices && Object.keys(prices).length > 0) {
      console.log('✅ Scraped Prices:', prices);
      
      // Temporary: Filter out 21k until the database constraint is updated manually
      const safePrices = { ...prices };
      delete safePrices['21k'];
      
      await savePrices(shine.id, safePrices);
      console.log('💾 Successfully saved valid prices (24k, 22k, 18k) to database.');
    } else {
      console.error('❌ Failed to extract prices.');
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

saveShine();
