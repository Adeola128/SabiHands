import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.log("No anon key found.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Querying for SH-PZKS2F...");
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      gigs(title, type, organizations(name)),
      users(volunteer_profiles(full_name))
    `)
    .eq('verification_code', 'SH-PZKS2F')
    .maybeSingle();

  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

run();
