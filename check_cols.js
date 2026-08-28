import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://menijtrnjpdwevmpkvjx.supabase.co';
const supabaseAnonKey = 'sb_publishable_GiBXJ8nKj3Zw5p8fFK3-wA_rIbjr95h';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('community_posts').select('*').limit(1);
  if (error) console.error(error.message);
  else console.log(data);
}

run();
