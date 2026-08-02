import React from 'react';

const ReportsAnalytics: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Reports & Analytics</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Platform-wide reporting for the internal team.</p>
        </div>
        <button style={{ padding: '8px 16px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Generate PDF Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="admin-card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>User Growth (YTD)</h3>
          <div style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '14px' }}>
            [Chart Area: Line Graph showing Volunteer vs Org growth]
          </div>
        </div>

        <div className="admin-card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Gigs by Category</h3>
          <div style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '14px' }}>
            [Chart Area: Donut Chart showing gig distribution]
          </div>
        </div>

        <div className="admin-card" style={{ height: '300px', display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Revenue vs Support Tickets</h3>
          <div style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '14px' }}>
            [Chart Area: Bar Chart mapping MRR to support load]
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;