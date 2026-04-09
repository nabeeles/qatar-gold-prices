const { supabase } = require('./db');

async function addShine() {
  console.log('--- Adding Shine Jewelers ---');
  
  const { data: existing } = await supabase
    .from('providers')
    .select('id')
    .eq('name', 'Shine Jewelers')
    .single();

  if (!existing) {
      const { error } = await supabase
        .from('providers')
        .insert({
            name: 'Shine Jewelers',
            url: 'https://shine.qa/goldrate',
            scraping_type: 'direct',
            selectors: { "24k": "24k", "22k": "22k" }
        });
      if (error) console.error('Error adding Shine:', error.message);
      else console.log('Shine Jewelers added.');
  } else {
      console.log('Shine Jewelers already exists.');
  }
}

addShine();
