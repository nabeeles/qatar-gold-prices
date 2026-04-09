const puppeteer = require('puppeteer');

async function testMalabarDirectForm() {
  console.log('--- Direct Form Submission Test (Malabar) ---\n');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.goto('https://www.malabargoldanddiamonds.com/goldprice', { waitUntil: 'networkidle2' });
    
    console.log('Setting country to Qatar (QA)...');
    await page.select('#gold-country-list', 'QA');
    
    console.log('Submitting form via script...');
    await page.evaluate(() => {
        const countrySelect = document.getElementById('gold-country-list');
        if (countrySelect) {
            const form = countrySelect.closest('form');
            if (form) {
                form.submit();
            } else {
                // Try clicking the button if no form found
                const submitBtn = document.querySelector('.gold-rate-form button, .gold-rate-form input[type="submit"]');
                if (submitBtn) submitBtn.click();
            }
        }
    });

    console.log('Waiting for navigation/update...');
    await new Promise(r => setTimeout(r, 10000));

    const results = await page.evaluate(() => {
      const prices = {};
      const bodyText = document.body.innerText;
      
      // Look for Qatar specific text to confirm
      const isQatar = bodyText.includes('Qatar') && !bodyText.includes('INR');
      
      const allElements = Array.from(document.querySelectorAll('*'));
      for (const el of allElements) {
        if (!el.innerText || el.children.length > 0) continue;
        const text = el.innerText.trim();
        
        if (text.match(/24\s*K/i)) {
           const parentText = el.parentElement ? el.parentElement.innerText : "";
           const match = parentText.match(/(?:QAR|﷼)\s*(\d+(?:\,\d+)?(?:\.\d+)?)/i) || parentText.match(/(\d+(?:\,\d+)?(?:\.\d+)?)\s*(?:QAR|﷼)/i);
           if (match && !prices['24k']) prices['24k'] = match[1];
        }
        
        if (text.match(/22\s*K/i)) {
           const parentText = el.parentElement ? el.parentElement.innerText : "";
           const match = parentText.match(/(?:QAR|﷼)\s*(\d+(?:\,\d+)?(?:\.\d+)?)/i) || parentText.match(/(\d+(?:\,\d+)?(?:\.\d+)?)\s*(?:QAR|﷼)/i);
           if (match && !prices['22k']) prices['22k'] = match[1];
        }
      }
      return { prices, isQatar, url: window.location.href, content: bodyText.substring(0, 1000).replace(/\s+/g, ' ') };
    });

    console.log(`Final URL: ${results.url}`);
    console.log(`Is Qatar confirmed? ${results.isQatar}`);
    if (Object.keys(results.prices).length > 0) {
      console.log(`✅ Success for Malabar:`);
      console.log(`   24k: QAR ${results.prices['24k'] || 'Not found'}`);
      console.log(`   22k: QAR ${results.prices['22k'] || 'Not found'}`);
    } else {
      console.log(`⚠️  Prices not found. Content snippet: ${results.content}`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

testMalabarDirectForm();
