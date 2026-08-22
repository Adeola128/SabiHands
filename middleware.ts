import { next, rewrite } from '@vercel/edge';

export const config = {
  // Only run the middleware on document requests, skipping static assets and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|vite.svg).*)',
  ],
};

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // List of common bot user agents
  const botUserAgents = [
    'googlebot',
    'bingbot',
    'yandex',
    'baiduspider',
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'discordbot',
    'skypeuripreview',
    'slackbot',
    'whatsapp'
  ];

  const isBot = botUserAgents.some((bot) => 
    userAgent.toLowerCase().includes(bot)
  );

  if (isBot) {
    // Rewrite the URL to Prerender.io
    const prerenderUrl = `https://service.prerender.io/${url.href}`;
    
    return rewrite(prerenderUrl, {
      headers: {
        'X-Prerender-Token': 'oVeZCwVB9tgZIVWwZIEZ',
      },
    });
  }

  // Otherwise, continue to the original request
  return next();
}
