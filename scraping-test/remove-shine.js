const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeShine() {
  console.log('--- Deactivating Shine Jewelers ---');
  
  const { data, error } = await supabase
    .from('providers')
    .update({ is_active: false })
    .ilike('name', '%Shine%');

  if (error) {
    console.error('❌ Error deactivating provider:', error.message);
  } else {
    console.log('✅ Shine Jewelers has been deactivated in the database.');
  }
}

removeShine();
