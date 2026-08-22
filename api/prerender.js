export default async function handler(req, res) {
  // Prevent infinite loop if the request is coming from Prerender itself
  if (req.headers['x-prerender'] === '1') {
    return res.status(403).send('Loop detected');
  }

  // Get the original path from the query parameter passed by the rewrite
  const path = req.query.path || '';
  const targetUrl = `https://www.ralvo.com.ng/${path}`;
  const prerenderUrl = `https://service.prerender.io/${targetUrl}`;

  try {
    const response = await fetch(prerenderUrl, {
      headers: {
        'X-Prerender-Token': 'oVeZCwVB9tgZIVWwZIEZ'
      }
    });

    const html = await response.text();
    
    // Copy the status code from Prerender (e.g., 200, 404, 301)
    res.status(response.status);
    
    // Forward relevant headers if needed, mainly just Content-Type
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    res.send(html);
  } catch (error) {
    console.error('Error fetching from Prerender:', error);
    res.status(500).send('Error rendering page');
  }
}
