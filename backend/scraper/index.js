const { getActiveProviders, savePrices } = require('./utils/db');
const { scrapeWithPuppeteer } = require('./strategies/puppeteer');
const { checkAndSendAlerts } = require('./utils/alerts');

async function runScraper() {
  console.log('--- Starting Qatar Gold Price Scraper ---');
  console.log(`Time: ${new Date().toISOString()}`);

  try {
    const providers = await getActiveProviders();
    console.log(`Found ${providers.length} active providers.`);

    const allScrapedPrices = [];

    for (const provider of providers) {
      try {
        const prices = await scrapeWithPuppeteer(provider);

        if (prices && Object.keys(prices).some(k => k.match(/\d+k/i) && prices[k])) {
          console.log(`✅ Extracted prices for ${provider.name}:`, prices);
          await savePrices(provider.id, prices);
          
          Object.keys(prices).forEach(key => {
            const m = key.match(/^(\d+)k$/i);
            if (m && prices[key]) {
              allScrapedPrices.push({ karat: parseInt(m[1]), price: parseFloat(prices[key]) });
            }
          });
          
          console.log(`💾 Saved to database.`);
        } else {
          console.warn(`⚠️  No prices found for ${provider.name}.`);
        }
      } catch (err) {
        console.error(`❌ Failed to process ${provider.name}:`, err.message);
      }
    }

    // After all providers are scraped, check alerts using the averages
    if (allScrapedPrices.length > 0) {
        const uniqueKarats = [...new Set(allScrapedPrices.map(p => p.karat))];
        const averages = uniqueKarats.map(k => {
            const group = allScrapedPrices.filter(p => p.karat === k);
            return {
                karat: k,
                price: group.reduce((acc, curr) => acc + curr.price, 0) / group.length
            };
        });
        
        await checkAndSendAlerts(averages);
    }

    console.log('--- Scraper Run Finished ---');
  } catch (error) {
    console.error('CRITICAL ERROR:', error.message);
    process.exit(1);
  }
}

runScraper();
