import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://menijtrnjpdwevmpkvjx.supabase.co';
const supabaseAnonKey = 'sb_publishable_GiBXJ8nKj3Zw5p8fFK3-wA_rIbjr95h';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  console.log('Checking organizations...');
  const { data: orgs, error: orgError } = await supabase.from('organizations').select('*');
  if (orgError) {
    console.error('Org error:', orgError);
  } else {
    console.log(`Found ${orgs?.length || 0} organizations.`);
    if (orgs?.length > 0) console.log(orgs.slice(0, 2));
  }

  console.log('\nChecking volunteer_profiles...');
  const { data: vols, error: volError } = await supabase.from('volunteer_profiles').select('*');
  if (volError) {
    console.error('Vol error:', volError);
  } else {
    console.log(`Found ${vols?.length || 0} volunteer profiles.`);
    if (vols?.length > 0) console.log(vols.slice(0, 2));
  }
}

checkData();
