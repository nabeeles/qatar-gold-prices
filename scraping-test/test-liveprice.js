const puppeteer = require('puppeteer');

async function testLivePrice() {
  console.log('--- Testing New Provider (livepriceofgold.com) ---\n');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 1200 });
    const url = 'https://www.livepriceofgold.com/Qatar-gold-price.html';
    
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 10000));

    const result = await page.evaluate(() => {
        const res = {};
        
        const cleanPrice = (text) => {
            if (!text) return null;
            const match = text.match(/(\d{3,}(?:\.\d+)?)/);
            return match ? match[1].replace(/,/g, '') : null;
        };

        const rows = Array.from(document.querySelectorAll('tr'));
        
        for (const row of rows) {
            const rowText = row.innerText.trim();
            
            // Site structure: "24K Gold/gram -0.04 556.790 545.7 584.6"
            // We want the number immediately after the change percentage (-0.04)
            if (rowText.includes('Gold/gram')) {
                // Split by whitespace and filter out empty strings
                const parts = rowText.split(/\s+/).filter(p => p.length > 0);
                
                // Usually parts[0] is "24K", parts[1] is "Gold/gram", parts[2] is change percentage, parts[3] is the price
                const price = cleanPrice(parts[3]);
                if (!price) continue;

                if (rowText.includes('24K')) res['24k'] = price;
                else if (rowText.includes('22K')) res['22k'] = price;
                else if (rowText.includes('21K')) res['21k'] = price;
                else if (rowText.includes('18K')) res['18k'] = price;
            }
        }

        return {
            prices: res,
            htmlSnippet: document.body.innerText.substring(0, 2000).replace(/\s+/g, ' ')
        };
    });

    console.log('✅ Extracted Prices:', result.prices);
    if (Object.keys(result.prices).length === 0) {
        console.log('⚠️ Could not find specific prices. Page snippet:');
        console.log(result.htmlSnippet);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

testLivePrice();
