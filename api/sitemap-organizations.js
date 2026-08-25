import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  try {
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('id, user_id');

    if (error) {
      console.error('Error fetching orgs from Supabase:', error);
      throw error;
    }

    const baseUrl = 'https://www.ralvo.com.ng';
    
    const dynamicUrls = (orgs || []).map(org => {
      return `
  <url>
    <loc>${baseUrl}/organizations/${org.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${dynamicUrls}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=1800');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Failed to generate organizations sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}
