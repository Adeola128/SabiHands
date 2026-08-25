export default async function handler(req, res) {
  try {
    const baseUrl = 'https://www.ralvo.com.ng';

    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemaps/static.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemaps/opportunities.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemaps/organizations.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemaps/guides.xml</loc>
  </sitemap>
</sitemapindex>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=1800');
    res.status(200).send(sitemapIndex);
  } catch (error) {
    console.error('Failed to generate sitemap index:', error);
    res.status(500).send('Error generating sitemap index');
  }
}
