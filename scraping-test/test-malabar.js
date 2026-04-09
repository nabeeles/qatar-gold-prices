const puppeteer = require('puppeteer');

async function testMalabar() {
  console.log('--- Focused Scraping Test (Malabar Gold & Diamonds) ---\n');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    // Malabar often redirects based on IP/Region, so setting headers is crucial.
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    const url = 'https://www.malabargoldanddiamonds.com/store-locator/qatar/';
    
    console.log(`Checking ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('Waiting for content to stabilize...');
    await new Promise(r => setTimeout(r, 8000));

    // Log the page title to ensure we're on the right page (not redirected to India)
    const title = await page.title();
    console.log(`Page Title: ${title}`);

    const prices = await page.evaluate(() => {
      const results = {};
      const allElements = Array.from(document.querySelectorAll('*'));
      
      for (const el of allElements) {
        if (!el.innerText || el.children.length > 0) continue;
        const text = el.innerText.trim();
        
        // Match 24K pattern
        if (text.match(/24\s*K/i)) {
           // Look at surrounding text or parent for the price
           const parentText = el.parentElement ? el.parentElement.innerText : "";
           const match = parentText.match(/QAR\s*(\d+(?:\.\d+)?)/i) || parentText.match(/(\d+(?:\.\d+)?)\s*QAR/i);
           if (match && !results['24k']) results['24k'] = match[1];
        }
        
        // Match 22K pattern
        if (text.match(/22\s*K/i)) {
           const parentText = el.parentElement ? el.parentElement.innerText : "";
           const match = parentText.match(/QAR\s*(\d+(?:\.\d+)?)/i) || parentText.match(/(\d+(?:\.\d+)?)\s*QAR/i);
           if (match && !results['22k']) results['22k'] = match[1];
        }
      }
      return results;
    });

    if (Object.keys(prices).length > 0) {
      console.log(`✅ Success for Malabar:`);
      console.log(`   24k: QAR ${prices['24k'] || 'Not found'}`);
      console.log(`   22k: QAR ${prices['22k'] || 'Not found'}`);
    } else {
      console.log(`⚠️  Could not extract specific numeric prices.`);
      // Extract a snippet to see what's on the page
      const snippet = await page.evaluate(() => document.body.innerText.substring(0, 1500).replace(/\s+/g, ' '));
      console.log(`   Page content snippet: ${snippet}`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

testMalabar();
