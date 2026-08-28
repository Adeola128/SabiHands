import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
let supabaseUrl = '';
let supabaseKey = '';
for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  await supabase.auth.signInWithPassword({
    email: 'org@ralvo.com',
    password: 'password123'
  });
  
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    console.log("Not logged in");
    return;
  }
  
  const { data, error } = await supabase.from('organizations').select('*').eq('user_id', user.user.id).single();
  console.log("Org Data:", data);
  console.log("Org Error:", error);
}

check();
