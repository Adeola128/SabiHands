import React from 'react';

const SponsoredPlacement: React.FC = () => {
  const placements = [
    { id: 'p1', brand: 'Access Bank', campaign: 'Youth Empowerment', location: 'Dashboard Banner', status: 'Active', clicks: '2,401', expires: 'Aug 15, 2026' },
    { id: 'p2', brand: 'MTN Nigeria', campaign: 'Tech Skill Up', location: 'Gig Feed (Inline)', status: 'Scheduled', clicks: '0', expires: 'Sep 01, 2026' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Sponsored Placements</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Manage advertising and brand partnership placements.</p>
        </div>
        <button style={{ padding: '8px 16px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>+ New Campaign</button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Brand / Campaign</th>
                <th>Placement</th>
                <th>Status</th>
                <th>Clicks</th>
                <th>Expires</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {placements.map(placement => (
                <tr key={placement.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px' }}>{placement.brand}</div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{placement.campaign}</div>
                  </td>
                  <td>{placement.location}</td>
                  <td>
                    <span className={`admin-status-badge ${placement.status === 'Active' ? 'admin-status-approved' : 'admin-status-pending'}`}>
                      {placement.status}
                    </span>
                  </td>
                  <td><div style={{ fontWeight: 600, color: '#334155' }}>{placement.clicks}</div></td>
                  <td>{placement.expires}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
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

export default SponsoredPlacement;