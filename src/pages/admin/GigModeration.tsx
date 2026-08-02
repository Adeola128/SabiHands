import React from 'react';

const GigModeration: React.FC = () => {
  const flaggedGigs = [
    { id: 'g1', title: 'Data Entry Volunteers', org: 'FastCash Loan', reason: 'Spam / Scam', reportedBy: 4, status: 'Flagged' },
    { id: 'g2', title: 'Medical Outreach', org: 'LifePlus NGO', reason: 'Inappropriate Content', reportedBy: 1, status: 'Flagged' },
    { id: 'g3', title: 'Street Sweeping', org: 'Keep Lagos Clean', reason: 'Unsafe conditions', reportedBy: 2, status: 'Under Review' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Gig Moderation</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Review flagged or reported gigs to ensure platform safety.</p>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Gig Title / Organization</th>
                <th>Primary Reason</th>
                <th>Reports</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flaggedGigs.map(gig => (
                <tr key={gig.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px' }}>{gig.title}</div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{gig.org}</div>
                  </td>
                  <td>
                    <div style={{ display: 'inline-block', backgroundColor: '#FEE2E2', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                      {gig.reason}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                      {gig.reportedBy} Users
                    </div>
                  </td>
                  <td>
                    <span className={`admin-status-badge ${gig.status === 'Flagged' ? 'admin-status-rejected' : 'admin-status-pending'}`}>
                      {gig.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button style={{ padding: '8px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Take Down</button>
                      <button style={{ padding: '8px 16px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Ignore</button>
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

export default GigModeration;