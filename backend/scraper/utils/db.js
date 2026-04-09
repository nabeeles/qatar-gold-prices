const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getActiveProviders() {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;
  return data;
}

async function savePrices(providerId, prices) {
  const records = [];
  
  if (prices['24k']) {
      records.push({
        provider_id: providerId,
        karat: 24,
        price: parseFloat(prices['24k']),
        currency: 'QAR'
      });
  }
  if (prices['22k']) {
      records.push({
        provider_id: providerId,
        karat: 22,
        price: parseFloat(prices['22k']),
        currency: 'QAR'
      });
  }

  if (records.length === 0) return;

  const { error: insertError } = await supabase
    .from('gold_prices')
    .insert(records);

  if (insertError) throw insertError;

  const { error: updateError } = await supabase
    .from('providers')
    .update({ last_scraped_at: new Date().toISOString() })
    .eq('id', providerId);

  if (updateError) throw updateError;
}

module.exports = { supabase, getActiveProviders, savePrices };
