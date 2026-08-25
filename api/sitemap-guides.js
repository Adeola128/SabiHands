export default async function handler(req, res) {
  try {
    const baseUrl = 'https://www.ralvo.com.ng';
    
    // Core guides - We can update these as new guides are published
    const guidePages = [
      { path: '/guides/volunteer-in-nigeria-with-no-experience', priority: '0.7', changefreq: 'monthly' },
      { path: '/guides/verify-ngo', priority: '0.7', changefreq: 'monthly' },
      { path: '/guides/safe-volunteering', priority: '0.7', changefreq: 'monthly' },
      { path: '/guides/volunteer-certificates', priority: '0.7', changefreq: 'monthly' }
    ];

    const guideUrls = guidePages.map(page => `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${guideUrls}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=1800');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Failed to generate guides sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}
