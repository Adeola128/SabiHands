import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const guides = [
  {
    title: 'How to volunteer in Nigeria with no experience',
    description: 'A practical guide to finding and securing your first volunteer role in Nigeria without prior experience. Build your track record from scratch.',
    slug: 'volunteer-in-nigeria-with-no-experience',
    readTime: '5 min read',
    category: 'Getting Started'
  },
  {
    title: 'How to find legitimate NGO volunteer opportunities',
    description: 'Learn how to verify NGOs, avoid scams, and find legitimate organizations making a real impact in Nigeria.',
    slug: 'verify-ngo',
    readTime: '4 min read',
    category: 'Trust & Safety'
  }
];

const GuidesDirectory: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      <Helmet>
        <title>Practical Guides for Volunteers & NGOs &mdash; Ralvo</title>
        <meta name="description" content="Explore our library of practical guides on volunteering in Nigeria, finding remote gigs, verifying NGOs, and building your professional track record." />
        <link rel="canonical" href="https://www.ralvo.com.ng/guides" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Practical Guides for Volunteers & NGOs",
              "description": "Explore our library of practical guides on volunteering in Nigeria, finding remote gigs, verifying NGOs, and building your professional track record.",
              "mainEntity": {
                "@type": "ItemList",
                "itemListElement": [
                  ${guides.map((g, i) => `{
                    "@type": "ListItem",
                    "position": ${i + 1},
                    "url": "https://www.ralvo.com.ng/guides/${g.slug}"
                  }`).join(',\n                  ')}
                ]
              }
            }
          `}
        </script>
      </Helmet>

      {/* ── HEADER ── */}
      <div style={{ backgroundColor: 'var(--purple-900)', color: 'white', paddingTop: '160px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontFamily: 'var(--display)', fontWeight: 800, marginBottom: '24px' }}>
            Practical Guides
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--purple-100)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Everything you need to know about volunteering, verifying NGOs, and building a verifiable track record in Nigeria.
          </p>
        </div>
      </div>

      {/* ── BREADCRUMBS ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 0 24px' }}>
        <nav aria-label="breadcrumb" style={{ fontSize: '14px', color: 'var(--muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          <span style={{ color: 'var(--ink)' }}>Guides</span>
        </nav>
      </div>

      {/* ── GUIDES LIST ── */}
      <div style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
          {guides.map(guide => (
            <Link key={guide.slug} to={`/guides/${guide.slug}`} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #E4E1F5', overflow: 'hidden', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--purple-600)', marginBottom: '16px' }}>
                  {guide.category}
                </span>
                <h2 style={{ fontSize: '22px', fontFamily: 'var(--display)', fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px 0', lineHeight: 1.3 }}>
                  {guide.title}
                </h2>
                <p style={{ fontSize: '16px', color: 'var(--body)', marginBottom: '24px', lineHeight: 1.6, flex: 1 }}>
                  {guide.description}
                </p>
                <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    {guide.readTime}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--purple-600)', fontWeight: 600 }}>
                    Read article &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidesDirectory;
