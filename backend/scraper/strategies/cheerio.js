const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeWithCheerio(provider) {
  console.log(`[Cheerio] Scraping ${provider.name}...`);
  
  try {
    const { data } = await axios.get(provider.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      timeout: 30000
    });

    const $ = cheerio.load(data);
    const results = {};
    const bodyText = $('body').text().replace(/\s+/g, ' ');

    const findPrice = (karatLabel) => {
        // Find table rows containing the label
        let price = null;
        $('tr').each((i, row) => {
            const rowText = $(row).text();
            if (rowText.includes(karatLabel)) {
                const numbers = rowText.match(/\d+(?:\.\d+)?/g);
                if (numbers) {
                    // Find first number that is not the karat label itself
                    const karatNum = karatLabel.match(/\d+/)[0];
                    const found = numbers.find(n => n !== karatNum);
                    if (found) price = found;
                }
            }
        });

        // Fallback to regex on body text if not found in table
        if (!price) {
            const regex = new RegExp(`${karatLabel}\\s*\\/g\\s*[^\\d]*(\\d+(?:\\.\\d+)?)`, 'i');
            const match = bodyText.match(regex);
            if (match) price = match[1];
        }

        return price;
    };

    if (provider.selectors['24k']) results['24k'] = findPrice(provider.selectors['24k']);
    if (provider.selectors['22k']) results['22k'] = findPrice(provider.selectors['22k']);

    return results;
  } catch (error) {
    console.error(`[Cheerio] Error scraping ${provider.name}:`, error.message);
    return null;
  }
}

module.exports = { scrapeWithCheerio };
