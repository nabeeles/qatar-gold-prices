const puppeteer = require('puppeteer');

async function debugGoodReturns() {
  console.log(`\n--- Debugging: GoodReturns ---`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    console.log(`Navigating to https://www.goodreturns.in/gold-rates/qatar.html...`);
    await page.goto('https://www.goodreturns.in/gold-rates/qatar.html', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 10000));

    const data = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr')).map(r => r.innerText.trim()).filter(t => t.length > 0);
        const html = document.body.innerHTML.substring(0, 5000); // Check for tables
        return { title: document.title, rows, htmlSnippet: html.substring(0, 1000) };
    });

    console.log(`Page Title: ${data.title}`);
    console.log(`Rows Found:`, data.rows);

  } catch (error) {
    console.error(`Error debugging GoodReturns:`, error.message);
  } finally {
    await browser.close();
  }
}

debugGoodReturns();
