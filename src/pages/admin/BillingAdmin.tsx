import React from 'react';

const BillingAdmin: React.FC = () => {
  const invoices = [
    { id: 'INV-2026-001', org: 'Lagos Green Initiative', amount: '₦45,000', plan: 'Premium', status: 'Paid', date: 'Jul 28, 2026' },
    { id: 'INV-2026-002', org: 'Tech for Good Nigeria', amount: '₦15,000', plan: 'Basic', status: 'Pending', date: 'Jul 30, 2026' },
    { id: 'INV-2026-003', org: 'Oyo Health Initiative', amount: '₦45,000', plan: 'Premium', status: 'Overdue', date: 'Jul 15, 2026' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Billing & Membership</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Oversight of organization plans, payments, and invoices.</p>
        </div>
        <button style={{ padding: '8px 16px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Manage Plans</button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Organization</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td><div style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>{inv.id}</div></td>
                  <td>{inv.org}</td>
                  <td>{inv.plan}</td>
                  <td><div style={{ fontWeight: 700, color: '#334155' }}>{inv.amount}</div></td>
                  <td>
                    <span className={`admin-status-badge ${inv.status === 'Paid' ? 'admin-status-approved' : inv.status === 'Overdue' ? 'admin-status-rejected' : 'admin-status-pending'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>{inv.date}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>View</button>
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

export default BillingAdmin;