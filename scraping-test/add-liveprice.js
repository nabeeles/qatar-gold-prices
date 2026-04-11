const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addLivePrice() {
  console.log('--- Adding LivePriceOfGold Provider ---');
  
  const { data: existing } = await supabase
    .from('providers')
    .select('id')
    .eq('name', 'LivePriceOfGold')
    .single();

  if (!existing) {
      const { error } = await supabase
        .from('providers')
        .insert({
            name: 'LivePriceOfGold',
            url: 'https://www.livepriceofgold.com/Qatar-gold-price.html',
            scraping_type: 'direct',
            selectors: {}
        });
      if (error) console.error('❌ Error adding provider:', error.message);
      else console.log('✅ LivePriceOfGold added.');
  } else {
      console.log('ℹ️  LivePriceOfGold already exists.');
  }
}

addLivePrice();
