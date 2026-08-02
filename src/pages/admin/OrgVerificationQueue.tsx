import React, { useState } from 'react';

const OrgVerificationQueue: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');

  const pendingOrgs = [
    { id: 1, name: 'Ibadan Tech Hub', type: 'Tech Education', submitted: '2 hours ago', docs: 3 },
    { id: 2, name: 'Abuja Green Initiative', type: 'Environment', submitted: '5 hours ago', docs: 2 },
    { id: 3, name: 'Kwara Health Outreach', type: 'Healthcare', submitted: '1 day ago', docs: 4 },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Verification Queue</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Review and approve new organizations joining SabiHands.</p>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'pending' ? '#3B82F6' : 'transparent'}`, color: activeTab === 'pending' ? '#3B82F6' : '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            Pending Review
            <span style={{ background: activeTab === 'pending' ? '#DBEAFE' : '#F1F5F9', color: activeTab === 'pending' ? '#1D4ED8' : '#64748B', padding: '2px 8px', borderRadius: '99px', fontSize: '12px' }}>12</span>
          </button>
          <button 
            onClick={() => setActiveTab('reviewed')}
            style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'reviewed' ? '#3B82F6' : 'transparent'}`, color: activeTab === 'reviewed' ? '#3B82F6' : '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Recently Reviewed
          </button>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Category</th>
                <th>Documents</th>
                <th>Submitted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'pending' ? pendingOrgs.map(org => (
                <tr key={org.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px' }}>{org.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Registration: RC-12345{org.id}</div>
                  </td>
                  <td>{org.type}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3B82F6', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      {org.docs} Files Uploaded
                    </div>
                  </td>
                  <td>{org.submitted}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button style={{ padding: '8px 16px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Approve</button>
                      <button style={{ padding: '8px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Reject</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    No recently reviewed organizations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrgVerificationQueue;