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

  // Prevent infinite loop if the request is coming from Prerender itself
  if (request.headers.get('x-prerender') === '1') {
    return next();
  }

  // Extensive list of bot user agents (matches official prerender-node)
  const isBot = /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator|redditbot|Applebot|WhatsApp|flipboard|tumblr|bitlybot|SkypeUriPreview|nuzzel|Discordbot|Google Page Speed|Qwantify|Bitrix link preview|XING-contenttabreceiver|Chrome-Lighthouse|TelegramBot|prerender/i.test(userAgent);

  // Exclude static extensions just in case they slip through the matcher
  const isStatic = /\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|doc|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff|svg|eot)$/i.test(url.pathname);

  if (isBot && !isStatic) {
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
