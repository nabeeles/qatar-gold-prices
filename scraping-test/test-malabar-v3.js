const puppeteer = require('puppeteer');

async function testMalabarInteractiveV3() {
  console.log('--- Interactive Scraping Test V3 (Malabar Gold & Diamonds) ---\n');
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

    console.log('Selecting Qatar and Submitting...');
    await page.evaluate(async () => {
        const selects = Array.from(document.querySelectorAll('select'));
        const countrySelect = selects.find(s => s.innerText && s.innerText.includes('Qatar'));
        
        if (countrySelect) {
            const options = Array.from(countrySelect.options);
            const qatarOption = options.find(o => o.text.includes('Qatar'));
            if (qatarOption) {
                countrySelect.value = qatarOption.value;
                countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        await new Promise(r => setTimeout(r, 1000));

        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
        const submitBtn = buttons.find(b => b.innerText && b.innerText.trim().toLowerCase() === 'submit' || b.value === 'Submit');
        if (submitBtn) submitBtn.click();
    });

    console.log('Waiting for prices to update...');
    await new Promise(r => setTimeout(r, 10000));

    const results = await page.evaluate(() => {
      const prices = {};
      const rows = Array.from(document.querySelectorAll('tr, div.row, div.grid-item')); // common container patterns
      
      rows.forEach(row => {
          const text = row.innerText.trim();
          
          // Look for 24K
          if (text.match(/24\s*K/i)) {
              // Match numbers, excluding common small numbers like 24, 22, 18, 09 (day)
              const matches = text.match(/(\d{3,}(?:\,\d+)?(?:\.\d+)?)/g);
              if (matches && !prices['24k']) prices['24k'] = matches[0];
          }
          
          // Look for 22K
          if (text.match(/22\s*K/i)) {
              const matches = text.match(/(\d{3,}(?:\,\d+)?(?:\.\d+)?)/g);
              if (matches && !prices['22k']) prices['22k'] = matches[0];
          }
      });

      return { 
          prices,
          content: document.body.innerText.substring(0, 1500).replace(/\s+/g, ' ')
      };
    });

    if (Object.keys(results.prices).length > 0) {
      console.log(`✅ Success for Malabar:`);
      console.log(`   24k: ${results.prices['24k'] || 'Not found'}`);
      console.log(`   22k: ${results.prices['22k'] || 'Not found'}`);
    } else {
      console.log(`⚠️  Could not extract prices.`);
      console.log(`   Snippet: ${results.content}`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

testMalabarInteractiveV3();
