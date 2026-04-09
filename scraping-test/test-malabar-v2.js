const puppeteer = require('puppeteer');

async function testMalabarInteractive() {
  console.log('--- Interactive Scraping Test (Malabar Gold & Diamonds) ---\n');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    const url = 'https://www.malabargoldanddiamonds.com/goldprice';
    
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));

    console.log('Attempting to find and select Qatar...');
    
    // Malabar often uses custom dropdowns or modals for country selection.
    // Let's try to find a "Select Country" or similar text and click it.
    await page.evaluate(async () => {
        const findAndClick = (text) => {
            const elements = Array.from(document.querySelectorAll('button, a, span, div, li'));
            const target = elements.find(el => el.innerText && el.innerText.trim().toLowerCase().includes(text.toLowerCase()));
            if (target) {
                target.click();
                return true;
            }
            return false;
        };

        // 1. Look for something that looks like a country selector
        findAndClick('Select Country') || findAndClick('Country');
        
        // Wait a bit for dropdown/modal
        await new Promise(r => setTimeout(r, 2000));
        
        // 2. Look for "Qatar" and click it
        findAndClick('Qatar');
    });

    console.log('Waiting for prices to load after selection...');
    await new Promise(r => setTimeout(r, 8000));

    // Now extract prices using the robust text-matching logic
    const results = await page.evaluate(() => {
      const prices = {};
      const allElements = Array.from(document.querySelectorAll('*'));
      
      for (const el of allElements) {
        if (!el.innerText || el.children.length > 0) continue;
        const text = el.innerText.trim();
        
        if (text.match(/24\s*K/i)) {
           const parentText = el.parentElement ? el.parentElement.innerText : "";
           const match = parentText.match(/(?:QAR|﷼)\s*(\d+(?:\.\d+)?)/i) || parentText.match(/(\d+(?:\.\d+)?)\s*(?:QAR|﷼)/i);
           if (match && !prices['24k']) prices['24k'] = match[1];
        }
        
        if (text.match(/22\s*K/i)) {
           const parentText = el.parentElement ? el.parentElement.innerText : "";
           const match = parentText.match(/(?:QAR|﷼)\s*(\d+(?:\.\d+)?)/i) || parentText.match(/(\d+(?:\.\d+)?)\s*(?:QAR|﷼)/i);
           if (match && !prices['22k']) prices['22k'] = match[1];
        }
      }
      return { 
          prices, 
          title: document.title, 
          url: window.location.href,
          content: document.body.innerText.substring(0, 1000).replace(/\s+/g, ' ')
      };
    });

    if (Object.keys(results.prices).length > 0) {
      console.log(`✅ Success for Malabar:`);
      console.log(`   24k: QAR ${results.prices['24k'] || 'Not found'}`);
      console.log(`   22k: QAR ${results.prices['22k'] || 'Not found'}`);
    } else {
      console.log(`⚠️  Could not extract prices from ${results.url}`);
      console.log(`   Page Title: ${results.title}`);
      console.log(`   Snippet: ${results.content}`);
      
      // Secondary check: Search for any numbers near "Gold Rate"
      const fallback = await page.evaluate(() => {
          const body = document.body.innerText;
          return body.match(/(\d+(?:\.\d+)?)/g)?.slice(0, 20);
      });
      console.log('   Potential numeric values found on page:', fallback);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

testMalabarInteractive();
