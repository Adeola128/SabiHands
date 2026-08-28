import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://menijtrnjpdwevmpkvjx.supabase.co';
const supabaseAnonKey = 'sb_publishable_GiBXJ8nKj3Zw5p8fFK3-wA_rIbjr95h';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  console.log('Querying organizations...');
  const { data: orgs, error: orgError } = await supabase.from('organizations').select('id, name, bio, logo_url, cover_image_url, slug, created_at').limit(30);
  if (orgError) {
    console.error('Org error:', orgError);
  } else {
    console.log(`Found ${orgs?.length || 0} organizations.`);
  }

  console.log('\nQuerying volunteer_profiles...');
  const { data: vols, error: volError } = await supabase.from('volunteer_profiles').select('user_id, full_name, bio, avatar_url, cover_image_url, slug, created_at').limit(30);
  if (volError) {
    console.error('Vol error:', volError);
  } else {
    console.log(`Found ${vols?.length || 0} volunteer profiles.`);
  }
}

checkData();
