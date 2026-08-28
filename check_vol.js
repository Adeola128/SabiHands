import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://menijtrnjpdwevmpkvjx.supabase.co';
const supabaseAnonKey = 'sb_publishable_GiBXJ8nKj3Zw5p8fFK3-wA_rIbjr95h';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  const { data, error } = await supabase.from('volunteer_profiles').select('*').limit(1);
  if (error) console.error(error);
  else console.log(data);
}
checkData();
