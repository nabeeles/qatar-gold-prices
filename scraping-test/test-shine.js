const puppeteer = require('puppeteer');

async function testShine() {
  console.log('--- Focused Scraping Test (Shine Jewelers) ---\n');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 1200 });
    const url = 'https://shine.qa/goldrate';
    
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 10000));

    const prices = await page.evaluate(() => {
        const res = {};
        
        const cleanPrice = (text) => {
            if (!text) return null;
            // Extract number like 571 or 602.50
            const match = text.match(/(\d{3,}(?:\.\d+)?)/);
            return match ? match[1].replace(/,/g, '') : null;
        };

        const rows = Array.from(document.querySelectorAll('tr'));
        const headerRow = rows.find(r => r.innerText.includes('24ct') && r.innerText.includes('22ct'));
        const priceRow = rows.find(r => r.innerText.includes('QAR'));

        if (headerRow && priceRow) {
            const headers = Array.from(headerRow.querySelectorAll('th, td'));
            const pricesCells = Array.from(priceRow.querySelectorAll('th, td'));
            
            headers.forEach((h, i) => {
                const text = h.innerText.toLowerCase();
                const p = cleanPrice(pricesCells[i]?.innerText);
                if (!p) return;
                if (text.includes('24ct')) res['24k'] = p;
                else if (text.includes('22ct')) res['22k'] = p;
                else if (text.includes('21ct')) res['21k'] = p;
                else if (text.includes('18ct')) res['18k'] = p;
            });
        }
        return res;
    });

    console.log('✅ Scraped Prices for Shine:', prices);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

testShine();
