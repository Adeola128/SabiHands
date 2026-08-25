import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

interface GuideLayoutProps {
  title: string;
  description: string;
  slug: string;
  author?: string;
  publishDate?: string;
  children: React.ReactNode;
}

const GuideLayout: React.FC<GuideLayoutProps> = ({ 
  title, 
  description, 
  slug, 
  author = 'Ralvo Editorial Team', 
  publishDate = new Date().toISOString().split('T')[0],
  children 
}) => {
  const url = `https://www.ralvo.com.ng/guides/${slug}`;
  const isoDate = new Date(publishDate).toISOString();
  
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      <Helmet>
        <title>{title} &mdash; Ralvo Guides</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": "${title}",
              "description": "${description}",
              "image": "https://www.ralvo.com.ng/og-image.png",
              "author": {
                "@type": "Organization",
                "name": "${author}"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Ralvo",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.ralvo.com.ng/logo.png"
                }
              },
              "datePublished": "${isoDate}",
              "dateModified": "${isoDate}",
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "${url}"
              }
            }
          `}
        </script>
      </Helmet>

      {/* ── BREADCRUMBS ── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 24px 0 24px' }}>
        <nav aria-label="breadcrumb" style={{ fontSize: '14px', color: 'var(--muted)', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          <Link to="/guides" style={{ color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 600 }}>Guides</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          <span style={{ color: 'var(--ink)' }}>{title}</span>
        </nav>
      </div>

      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #E4E1F5', paddingTop: '48px', paddingBottom: '48px' }}>
        
        {/* Article Header */}
        <header style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid #E4E1F5', padding: '0 48px 24px 48px' }}>
          <h1 style={{ fontSize: '36px', fontFamily: 'var(--display)', fontWeight: 800, color: 'var(--ink)', marginBottom: '16px', lineHeight: 1.2 }}>
            {title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--muted)', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                R
              </div>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{author}</span>
            </div>
            <span>&bull;</span>
            <span>{new Date(publishDate).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </header>

        {/* Article Content */}
        <div className="guide-content" style={{ fontSize: '18px', lineHeight: 1.8, color: 'var(--body)', padding: '0 48px' }}>
          {children}
        </div>
        
        {/* Call to Action Footer */}
        <div style={{ marginTop: '64px', margin: '64px 48px 0 48px', padding: '32px', backgroundColor: 'var(--purple-50)', borderRadius: '16px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--purple-900)', marginBottom: '12px' }}>Ready to make an impact?</h3>
          <p style={{ fontSize: '16px', color: 'var(--purple-800)', marginBottom: '24px' }}>
            Join thousands of volunteers across Nigeria building their track record on Ralvo.
          </p>
          <Link to="/signup?role=volunteer" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: 'var(--purple-600)', color: 'white', fontWeight: 600, borderRadius: '12px', textDecoration: 'none' }}>
            Create your free profile
          </Link>
        </div>
      </article>
      
      {/* Basic styles for markdown-like content */}
      <style>{`
        .guide-content h2 {
          font-size: 28px;
          font-family: var(--display);
          font-weight: 700;
          color: var(--ink);
          margin: 40px 0 16px 0;
        }
        .guide-content h3 {
          font-size: 22px;
          font-weight: 700;
          color: var(--ink);
          margin: 32px 0 16px 0;
        }
        .guide-content p {
          margin-bottom: 24px;
        }
        .guide-content ul {
          margin-bottom: 24px;
          padding-left: 24px;
        }
        .guide-content li {
          margin-bottom: 8px;
        }
        .guide-content a {
          color: var(--purple-600);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default GuideLayout;
