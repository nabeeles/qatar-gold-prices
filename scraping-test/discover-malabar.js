const puppeteer = require('puppeteer');

async function discoverMalabarStructure() {
  console.log('--- Malabar Structure Discovery ---\n');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.goto('https://www.malabargoldanddiamonds.com/goldprice', { waitUntil: 'networkidle2' });
    
    const info = await page.evaluate(() => {
        const selects = Array.from(document.querySelectorAll('select'));
        const countrySelect = selects.find(s => s.innerText.includes('Qatar'));
        
        let options = [];
        let selectId = null;
        if (countrySelect) {
            selectId = countrySelect.id || countrySelect.name;
            options = Array.from(countrySelect.options).map(o => ({ text: o.text, value: o.value }));
        }

        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
        const submitInfo = buttons.map(b => ({ text: b.innerText || b.value, id: b.id, type: b.type }));

        return { selectId, options, submitInfo };
    });

    console.log('Select Element Info:', info.selectId);
    console.log('Options:', JSON.stringify(info.options, null, 2));
    console.log('Buttons:', JSON.stringify(info.submitInfo, null, 2));

    // Try to select Qatar and Submit
    if (info.selectId && info.options.some(o => o.text.includes('Qatar'))) {
        const qatarValue = info.options.find(o => o.text.includes('Qatar')).value;
        console.log(`Selecting value: ${qatarValue}`);
        
        await page.select(`#${info.selectId}` || `select[name="${info.selectId}"]`, qatarValue);
        await new Promise(r => setTimeout(r, 1000));
        
        console.log('Clicking Submit...');
        const submitBtnSelector = 'input[type="submit"], button[type="submit"]';
        
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => console.log('No navigation triggered, likely AJAX')),
            page.click(submitBtnSelector).catch(() => console.log('Could not click submit via selector'))
        ]);

        await new Promise(r => setTimeout(r, 5000));
        const finalUrl = page.url();
        const content = await page.evaluate(() => document.body.innerText.substring(0, 2000));
        
        console.log(`Final URL: ${finalUrl}`);
        console.log('Content Snippet:', content.replace(/\s+/g, ' ').substring(0, 1000));
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

discoverMalabarStructure();
