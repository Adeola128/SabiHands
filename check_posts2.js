import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://menijtrnjpdwevmpkvjx.supabase.co';
const supabaseAnonKey = 'sb_publishable_GiBXJ8nKj3Zw5p8fFK3-wA_rIbjr95h';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuery(name, query) {
  const { data, error } = await query;
  if (error) {
    console.error(`Error in ${name}:`, error.message);
  } else {
    console.log(`Success in ${name}`);
    console.log(data);
  }
}

async function run() {
  await testQuery('posts_direct', supabase.from('community_posts').select(`
    id, content, image_url, created_at, author_id,
    volunteer_profiles(full_name, avatar_url),
    organizations(name, logo_url)
  `).limit(1));
}

run();
