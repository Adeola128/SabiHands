export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const acceptHeader = request.headers.get('Accept') || '';

    // 1. Check if an AI agent is asking for markdown
    if (acceptHeader.includes('text/markdown')) {
      // Build basic markdown depending on the path
      let markdown = `# Ralvo\n\nRalvo is a platform designed to connect volunteers, non-profits, and organizations to make a positive impact in the community.\n\n## About Us\nWe believe in empowering individuals to contribute their skills and time to meaningful causes. Whether you are looking for volunteer opportunities or organizations needing help, Ralvo is your hub.\n\n`;

      if (url.pathname.includes('gigs')) {
        markdown += `## Active Gigs\nExplore current volunteer opportunities:\n- Community Cleanup\n- Mentorship Programs\n- Food Drive Assistance\n*(This is a static representation for AI agents. Visit the full site for live gigs.)*\n`;
      } else if (url.pathname.includes('organizations')) {
        markdown += `## Organizations\nDiscover verified non-profits and NGOs making a difference through Ralvo. Partner with us to scale your impact.\n`;
      } else if (url.pathname.includes('apply')) {
        markdown += `## Apply Now\nJoin the movement! Sign up to become a volunteer and start earning points and rewards for your contributions.\n`;
      } else {
        markdown += `## Navigate\n- [Home](https://www.ralvo.com.ng/)\n- [Gigs](https://www.ralvo.com.ng/gigs)\n- [Organizations](https://www.ralvo.com.ng/organizations)\n- [Apply](https://www.ralvo.com.ng/apply)\n`;
      }

      // Return the Markdown response directly from the Edge
      return new Response(markdown, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
      });
    }

    // 2. If it's a normal human (or normal bot), let the request pass through to Vercel untouched
    return fetch(request);
  },
};
