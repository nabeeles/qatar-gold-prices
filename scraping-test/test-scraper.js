const puppeteer = require('puppeteer');

async function testAlFardan() {
  console.log('--- Focused Scraping Test (Al Fardan Exchange) ---\n');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    const url = 'https://alfardanexchange.com.qa/gold-rates';
    
    console.log(`Checking ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise(r => setTimeout(r, 5000));

    const prices = await page.evaluate(() => {
      const results = {};
      const allElements = Array.from(document.querySelectorAll('*'));
      
      for (const el of allElements) {
        if (!el.innerText) continue;
        const text = el.innerText.trim();
        
        if (text.includes('24 KARAT')) {
           const match = text.match(/QAR\s*(\d+)/i);
           if (match) results['24k'] = match[1];
        }
        if (text.includes('22 KARAT')) {
           const match = text.match(/QAR\s*(\d+)/i);
           if (match) results['22k'] = match[1];
        }
      }
      return results;
    });

    if (Object.keys(prices).length > 0) {
      console.log(`✅ Success for Al Fardan:`);
      console.log(`   24k: QAR ${prices['24k'] || 'Not found'}`);
      console.log(`   22k: QAR ${prices['22k'] || 'Not found'}`);
    } else {
      console.log(`⚠️  Could not extract specific numeric prices.`);
      const snippet = await page.evaluate(() => document.body.innerText.substring(0, 1000).replace(/\s+/g, ' '));
      console.log(`   Page content snippet: ${snippet}`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

testAlFardan();
