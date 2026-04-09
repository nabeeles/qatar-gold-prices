const puppeteer = require('puppeteer');

async function testAggregator() {
  console.log('--- Focused Scraping Test (GoodReturns - Qatar Gold Rates) ---\n');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    const url = 'https://www.goodreturns.in/gold-rates/qatar.html';
    
    console.log(`Checking ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('Waiting for content to stabilize...');
    await new Promise(r => setTimeout(r, 10000));

    const prices = await page.evaluate(() => {
      const results = {};
      
      // Look for table rows specifically
      const rows = Array.from(document.querySelectorAll('tr'));
      
      rows.forEach(row => {
          const text = row.innerText.trim();
          
          // Match 24K Gold row
          if (text.match(/24\s*K\s*Gold/i) || text.match(/24\s*Karat\s*Gold/i)) {
              // Extract the first number found in this row that is not "24"
              const numbers = text.match(/\d+(?:\.\d+)?/g);
              if (numbers) {
                  const price = numbers.find(n => n !== "24");
                  if (price && !results['24k']) results['24k'] = price;
              }
          }
          
          // Match 22K Gold row
          if (text.match(/22\s*K\s*Gold/i) || text.match(/22\s*Karat\s*Gold/i)) {
              const numbers = text.match(/\d+(?:\.\d+)?/g);
              if (numbers) {
                  const price = numbers.find(n => n !== "22");
                  if (price && !results['22k']) results['22k'] = price;
              }
          }
      });

      // Fallback: If no table rows found, try the general text approach
      if (Object.keys(results).length === 0) {
          const bodyText = document.body.innerText;
          const match24 = bodyText.match(/24\s*K\s*Gold\s*\/g\s*[^\d]*(\d+)/i);
          if (match24) results['24k'] = match24[1];
          
          const match22 = bodyText.match(/22\s*K\s*Gold\s*\/g\s*[^\d]*(\d+)/i);
          if (match22) results['22k'] = match22[1];
      }

      return results;
    });

    if (Object.keys(prices).length > 0) {
      console.log(`✅ Success for GoodReturns (Aggregator):`);
      console.log(`   24k: QAR ${prices['24k'] || 'Not found'}`);
      console.log(`   22k: QAR ${prices['22k'] || 'Not found'}`);
    } else {
      console.log(`⚠️  Could not extract specific numeric prices.`);
      const snippet = await page.evaluate(() => document.body.innerText.substring(0, 1500).replace(/\s+/g, ' '));
      console.log(`   Page content snippet: ${snippet}`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

testAggregator();
