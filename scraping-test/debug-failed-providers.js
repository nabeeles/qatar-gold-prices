const puppeteer = require('puppeteer');

async function debugProvider(name, url, interaction = null) {
  console.log(`\n--- Debugging: ${name} ---`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    if (interaction) {
        console.log(`Executing interaction for ${name}...`);
        await page.evaluate(interaction);
        console.log(`Waiting for content update...`);
        await new Promise(r => setTimeout(r, 15000)); // Long wait for AJAX/Reload
    } else {
        await new Promise(r => setTimeout(r, 10000));
    }

    const data = await page.evaluate(() => {
        // Capture a few things:
        // 1. All table rows text
        const rows = Array.from(document.querySelectorAll('tr')).map(r => r.innerText.trim()).filter(t => t.length > 0);
        // 2. All elements containing "24" or "22"
        const candidates = Array.from(document.querySelectorAll('*'))
            .filter(el => el.children.length === 0 && (el.innerText.includes('24') || el.innerText.includes('22')))
            .map(el => ({
                tag: el.tagName,
                text: el.innerText.trim(),
                parentText: el.parentElement ? el.parentElement.innerText.trim().substring(0, 100) : ''
            }));
        
        return {
            title: document.title,
            url: window.location.href,
            rows: rows.slice(0, 20),
            candidates: candidates.slice(0, 20)
        };
    });

    console.log(`Final URL: ${data.url}`);
    console.log(`Page Title: ${data.title}`);
    console.log(`Table Rows (First 20):`, data.rows);
    console.log(`Candidates (First 20):`, data.candidates);

  } catch (error) {
    console.error(`Error debugging ${name}:`, error.message);
  } finally {
    await browser.close();
  }
}

async function runDebug() {
    // 1. Debug GoodReturns
    await debugProvider('GoodReturns', 'https://www.goodreturns.in/gold-rates/qatar.html');

    // 2. Debug Malabar
    const malabarInteraction = async () => {
        const countrySelect = document.getElementById('gold-country-list');
        if (countrySelect) {
            countrySelect.value = 'QA';
            countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
            await new Promise(r => setTimeout(r, 2000));
            const submitBtn = document.querySelector('.gold-rate-form button, .gold-rate-form input[type="submit"]');
            if (submitBtn) submitBtn.click();
        }
    };
    await debugProvider('Malabar Gold', 'https://www.malabargoldanddiamonds.com/goldprice', malabarInteraction);
}

runDebug();
