const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixConstraint() {
  console.log('--- Fixing Karat Constraint ---');
  
  const { error } = await supabase.rpc('execute_sql', {
    sql_query: "ALTER TABLE gold_prices DROP CONSTRAINT IF EXISTS gold_prices_karat_check; ALTER TABLE gold_prices ADD CONSTRAINT gold_prices_karat_check CHECK (karat IN (24, 22, 21, 18));"
  });

  if (error) {
    // If RPC doesn't exist, we can't do it via Supabase JS directly
    console.error('❌ Error fixing constraint (RPC likely not enabled):', error.message);
  } else {
    console.log('✅ Constraint updated successfully.');
  }
}

fixConstraint();
