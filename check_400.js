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
  }
}

async function run() {
  await testQuery('orgs', supabase.from('organizations').select('id, name, bio, logo_url, cover_url, slug, created_at').limit(1));
  await testQuery('vols1', supabase.from('volunteer_profiles').select('user_id, full_name, bio, avatar_url, slug, created_at').limit(1));
  await testQuery('vols2', supabase.from('volunteer_profiles').select('id, full_name, bio, avatar_url, slug').limit(1));
  await testQuery('posts', supabase.from('community_posts').select('id, content, image_url, created_at, author_id, author:users(id, role, volunteer_profiles(full_name), organizations(name)), likes:community_likes(user_id), comments:community_comments(id, content, created_at, author:users(id, role, volunteer_profiles(full_name), organizations(name)))').limit(1));
}

run();
