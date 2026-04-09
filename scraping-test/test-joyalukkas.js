const puppeteer = require('puppeteer');

async function testJoyalukkas() {
  console.log('--- Focused Scraping Test (Joyalukkas) ---\n');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    const url = 'https://www.joyalukkas.com/qa/goldrate';
    
    console.log(`Checking ${url}...`);
    // Using a longer timeout and waiting for network to be idle
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Additional wait for dynamic content
    console.log('Waiting for content to stabilize...');
    await new Promise(r => setTimeout(r, 10000));

    const prices = await page.evaluate(() => {
      const results = {};
      const allElements = Array.from(document.querySelectorAll('*'));
      
      // Joyalukkas might use "24K" or "22K" instead of "KARAT"
      for (const el of allElements) {
        if (!el.innerText || el.children.length > 0) continue; // Only look at leaf nodes with text
        const text = el.innerText.trim();
        
        // Look for 24K pattern
        if (text.match(/24\s*K/i)) {
           // Try to find the price in the next element or nearby
           const parentText = el.parentElement ? el.parentElement.innerText : "";
           const match = parentText.match(/QAR\s*(\d+(?:\.\d+)?)/i) || parentText.match(/(\d+(?:\.\d+)?)\s*QAR/i);
           if (match && !results['24k']) results['24k'] = match[1];
        }
        
        // Look for 22K pattern
        if (text.match(/22\s*K/i)) {
           const parentText = el.parentElement ? el.parentElement.innerText : "";
           const match = parentText.match(/QAR\s*(\d+(?:\.\d+)?)/i) || parentText.match(/(\d+(?:\.\d+)?)\s*QAR/i);
           if (match && !results['22k']) results['22k'] = match[1];
        }
      }
      return results;
    });

    if (Object.keys(prices).length > 0) {
      console.log(`✅ Success for Joyalukkas:`);
      console.log(`   24k: QAR ${prices['24k'] || 'Not found'}`);
      console.log(`   22k: QAR ${prices['22k'] || 'Not found'}`);
    } else {
      console.log(`⚠️  Could not extract specific numeric prices.`);
      const snippet = await page.evaluate(() => document.body.innerText.substring(0, 2000).replace(/\s+/g, ' '));
      console.log(`   Page content snippet: ${snippet}`);
      
      // List some potential candidates to help refine
      const candidates = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('span, div, td, p'))
            .filter(el => el.innerText.includes('24') || el.innerText.includes('22'))
            .map(el => el.innerText.trim())
            .slice(0, 10);
      });
      console.log('   Potential price candidates:', candidates);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

testJoyalukkas();
