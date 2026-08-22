import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://menijtrnjpdwevmpkvjx.supabase.co', 'sb_publishable_GiBXJ8nKj3Zw5p8fFK3-wA_rIbjr95h');
supabase.from('certificates').select('*, gigs(title, type, organizations(name, logo_url)), attendance(hours)').limit(1).single().then(({data, error}) => console.log(JSON.stringify(data, null, 2), error));
