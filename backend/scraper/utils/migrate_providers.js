const { supabase } = require('./db');

async function migrate() {
  console.log('--- Migrating Provider Configs ---');
  
  // 1. Switch GoodReturns to Puppeteer (direct)
  const { error: err1 } = await supabase
    .from('providers')
    .update({ scraping_type: 'direct' })
    .eq('name', 'GoodReturns Aggregator');
  
  if (err1) console.error('Error updating GoodReturns:', err1.message);
  else console.log('GoodReturns switched to Puppeteer.');

  // 2. Update Al Fardan selectors to be more specific
  // The test showed it might need "24 KARAT" and "22 KARAT" exactly.
  const { error: err2 } = await supabase
    .from('providers')
    .update({ selectors: { "24k": "24 KARAT", "22k": "22 KARAT" } })
    .eq('name', 'Al Fardan Exchange');

  if (err2) console.error('Error updating Al Fardan:', err2.message);
  else console.log('Al Fardan selectors updated.');

  // 3. Add Malabar (Interactive version)
  const { data: existingMalabar } = await supabase
    .from('providers')
    .select('id')
    .eq('name', 'Malabar Gold')
    .single();

  if (!existingMalabar) {
      const { error: err3 } = await supabase
        .from('providers')
        .insert({
            name: 'Malabar Gold',
            url: 'https://www.malabargoldanddiamonds.com/goldprice',
            scraping_type: 'direct',
            selectors: { "24k": "24K", "22k": "22K", "interactive": true }
        });
      if (err3) console.error('Error adding Malabar:', err3.message);
      else console.log('Malabar Gold added to providers.');
  }

  console.log('--- Migration Finished ---');
}

migrate();
