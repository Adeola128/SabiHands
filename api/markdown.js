export default function handler(req, res) {
  // Get the original path from the query parameter we will set in vercel.json
  const path = req.query.path || '/';

  // Set the correct headers for markdown
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  // Base markdown structure
  let markdown = `# Ralvo

Ralvo is a platform designed to connect volunteers, non-profits, and organizations to make a positive impact in the community. 

## About Us
We believe in empowering individuals to contribute their skills and time to meaningful causes. Whether you are looking for volunteer opportunities or organizations needing help, Ralvo is your hub.

`;

  // Add specific content based on the route requested by the AI agent
  if (path.includes('gigs')) {
    markdown += `## Active Gigs
Explore current volunteer opportunities:
- Community Cleanup
- Mentorship Programs
- Food Drive Assistance
*(This is a static representation for agents. Visit the full site for live gigs.)*
`;
  } else if (path.includes('organizations')) {
    markdown += `## Organizations
Discover verified non-profits and NGOs making a difference through Ralvo. Partner with us to scale your impact.
`;
  } else if (path.includes('apply')) {
    markdown += `## Apply Now
Join the movement! Sign up to become a volunteer and start earning points and rewards for your contributions.
`;
  } else {
    markdown += `## Navigate
- [Home](https://www.ralvo.com.ng/)
- [Gigs](https://www.ralvo.com.ng/gigs)
- [Organizations](https://www.ralvo.com.ng/organizations)
- [Apply](https://www.ralvo.com.ng/apply)
`;
  }

  return res.status(200).send(markdown);
}
