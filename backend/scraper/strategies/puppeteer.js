const puppeteer = require('puppeteer');

async function scrapeWithPuppeteer(provider) {
  console.log(`[Puppeteer] Scraping ${provider.name}...`);
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 1200 });

    console.log(`   Navigating to ${provider.url}...`);
    await page.goto(provider.url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // 1. PROVIDER SPECIFIC INTERACTIONS
    if (provider.name.includes('Malabar')) {
        console.log('   Selecting Qatar for Malabar...');
        await page.select('#gold-country-list', 'QA');
        await page.evaluate(() => {
            const btn = document.querySelector('.gold-rate-btn') || document.querySelector('button.gold-rate-btn');
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 12000));
    } 
    else if (provider.name.includes('Shine')) {
        await new Promise(r => setTimeout(r, 10000));
    }
    else {
        await new Promise(r => setTimeout(r, 8000));
    }

    const prices = await page.evaluate((pName) => {
        const res = {};
        
        const cleanPrice = (text) => {
            if (!text) return null;
            // Extract number like 571 or 602.50
            const match = text.match(/(\d{3,}(?:\.\d+)?)/);
            return match ? match[1].replace(/,/g, '') : null;
        };

        // --- STRATEGY: Shine Jewelers ---
        if (pName.includes('Shine')) {
            const headers = Array.from(document.querySelectorAll('th, td, div')).filter(el => el.innerText && el.innerText.includes('ct'));
            const header24 = headers.find(h => h.innerText.includes('24ct'));
            const header22 = headers.find(h => h.innerText.includes('22ct'));

            if (header24) {
                 if (header24.nextElementSibling) res['24k'] = cleanPrice(header24.nextElementSibling.innerText);
                 if (!res['24k'] && header24.parentElement && header24.parentElement.nextElementSibling) res['24k'] = cleanPrice(header24.parentElement.nextElementSibling.innerText);
            }
            if (header22) {
                 if (header22.nextElementSibling) res['22k'] = cleanPrice(header22.nextElementSibling.innerText);
                 if (!res['22k'] && header22.parentElement && header22.parentElement.nextElementSibling) res['22k'] = cleanPrice(header22.parentElement.nextElementSibling.innerText);
            }
            
            // Fallback for Shine if table structure varies
            if (!res['24k']) {
                const blocks = Array.from(document.querySelectorAll('div')).filter(b => b.innerText && b.innerText.includes('QAR'));
                const p24Block = blocks.find(b => b.innerText.includes('24ct') && b.children.length < 5);
                if (p24Block) res['24k'] = cleanPrice(p24Block.innerText);
            }
            if (!res['22k']) {
                const blocks = Array.from(document.querySelectorAll('div')).filter(b => b.innerText && b.innerText.includes('QAR'));
                const p22Block = blocks.find(b => b.innerText.includes('22ct') && b.children.length < 5);
                if (p22Block) res['22k'] = cleanPrice(p22Block.innerText);
            }
            return res;
        }

        // --- STRATEGY: Al Fardan ---
        if (pName.includes('Fardan')) {
            const all = Array.from(document.querySelectorAll('*')).filter(el => !el.children || el.children.length === 0);
            const findGeneric = (label) => {
                for (const el of all) {
                    if (el.innerText && el.innerText.toUpperCase().includes(label)) {
                        const text = el.parentElement ? el.parentElement.innerText : el.innerText;
                        const p = cleanPrice(text);
                        if (p) return p;
                    }
                }
                return null;
            };
            res['24k'] = findGeneric('24 KARAT') || findGeneric('24K');
            res['22k'] = findGeneric('22 KARAT') || findGeneric('22K');
            return res;
        }

        // --- STRATEGY: GoodReturns ---
        if (pName.includes('GoodReturns')) {
            const rows = Array.from(document.querySelectorAll('tr'));
            const gramRows = rows.filter(r => r.innerText.trim().startsWith('1\t﷼') || r.innerText.trim().startsWith('1 ﷼'));
            if (gramRows.length >= 2) {
                res['24k'] = cleanPrice(gramRows[0].innerText.split(/[\t\s]+/)[1]);
                res['22k'] = cleanPrice(gramRows[1].innerText.split(/[\t\s]+/)[1]);
            }
            return res;
        }

        // --- STRATEGY: Malabar ---
        if (pName.includes('Malabar')) {
            const p22 = document.querySelector('[class*="22kt-price"]');
            const p24 = document.querySelector('[class*="24kt-price"]');
            if (p22 && !p22.innerText.includes('INR')) res['22k'] = cleanPrice(p22.innerText);
            if (p24 && !p24.innerText.includes('INR')) res['24k'] = cleanPrice(p24.innerText);
            return res;
        }

        // --- GENERIC FALLBACK (Joyalukkas) ---
        const all = Array.from(document.querySelectorAll('*')).filter(el => !el.children || el.children.length === 0);
        const findGeneric = (label) => {
            for (const el of all) {
                if (el.innerText && el.innerText.toUpperCase().includes(label)) {
                    const text = el.parentElement ? el.parentElement.innerText : el.innerText;
                    const p = cleanPrice(text);
                    if (p) return p;
                }
            }
            return null;
        };
        res['24k'] = findGeneric('24K') || findGeneric('24 KARAT');
        res['22k'] = findGeneric('22K') || findGeneric('22 KARAT');

        return res;
    }, provider.name);

    return prices;

  } catch (err) {
    console.error(`   [Error] ${err.message}`);
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeWithPuppeteer };
