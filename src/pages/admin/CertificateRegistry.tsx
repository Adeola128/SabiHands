import React from 'react';

const CertificateRegistry: React.FC = () => {
  const certificates = [
    { id: 'SH-8241', volunteer: 'Adeola Okonkwo', org: 'CodeLagos NGO', gig: 'Tech For Kids Mentorship', date: 'July 10, 2026', hours: 4 },
    { id: 'SH-6022', volunteer: 'Adeola Okonkwo', org: 'Lagos Food Bank', gig: 'Food Drive Packaging', date: 'March 5, 2026', hours: 5 },
    { id: 'SH-5921', volunteer: 'Chidi Okeke', org: 'Tech for Good Nigeria', gig: 'Website Audit', date: 'Feb 28, 2026', hours: 12 },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Certificate Registry & Audit Log</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Immutable ledger of all verified certificates issued on SabiHands.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="admin-topbar-search" style={{ width: '280px', backgroundColor: 'white', border: '1px solid #E2E8F0' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search by Cert ID..." />
          </div>
          <button style={{ padding: '8px 16px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Export CSV</button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Volunteer</th>
                <th>Organization / Gig</th>
                <th>Hours</th>
                <th>Date Issued</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map(cert => (
                <tr key={cert.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#3B82F6', fontSize: '14px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                      {cert.id}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>{cert.volunteer}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>{cert.org}</div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{cert.gig}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#10B981' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {cert.hours} hrs
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '14px', color: '#64748B' }}>{cert.date}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>View Ledger</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CertificateRegistry;