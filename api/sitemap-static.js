export default async function handler(req, res) {
  try {
    const baseUrl = 'https://www.ralvo.com.ng';
    
    // Core static pages
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/about', priority: '0.8', changefreq: 'weekly' },
      { path: '/faq', priority: '0.8', changefreq: 'weekly' },
      { path: '/for-organizations', priority: '0.8', changefreq: 'weekly' },
      { path: '/for-volunteers', priority: '0.8', changefreq: 'weekly' },
      { path: '/login', priority: '0.5', changefreq: 'monthly' },
      { path: '/signup', priority: '0.5', changefreq: 'monthly' }
    ];

    const staticUrls = staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=1800');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Failed to generate static sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}
