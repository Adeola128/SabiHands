import React from 'react';

const MembershipBilling: React.FC = () => {
  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Current Plan</h2>
            
            <div style={{ padding: '16px', backgroundColor: 'var(--purple-50)', borderRadius: '12px', border: '1px solid var(--purple-200)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--purple-900)' }}>Pro Plan</div>
                <div style={{ fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--purple-600)', color: 'white', padding: '2px 8px', borderRadius: '99px' }}>Active</div>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--purple-900)', opacity: 0.8 }}>Billed annually at ₦120,000/yr</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--muted)' }}>Renewal Date</span>
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Oct 15, 2026</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--muted)' }}>Members</span>
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>3 of 5</span>
              </div>
            </div>
            
            <button style={{ width: '100%', marginTop: '20px', padding: '10px 16px', backgroundColor: 'var(--white)', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              Cancel Subscription
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        {/* Payment Method */}
        <div className="dash-card" style={{ marginBottom: '24px' }}>
          <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="dash-card-title">Payment Method</h2>
            <button style={{ padding: '8px 16px', backgroundColor: 'var(--white)', border: '1.5px solid #E4E1F5', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', color: 'var(--ink)' }}>
              Update
            </button>
          </div>
          <div className="dash-card-padding">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #E4E1F5', borderRadius: '12px', backgroundColor: 'var(--paper)' }}>
              <div style={{ width: '48px', height: '32px', backgroundColor: 'var(--purple-900)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '12px', fontStyle: 'italic' }}>
                VISA
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>Visa ending in 4242</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Expires 12/28</div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Billing History</h2>
          </div>
          <div style={{ padding: '0 24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E4E1F5' }}>
                  <th style={{ textAlign: 'left', padding: '16px 0', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '16px 0', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '16px 0', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                  <th style={{ textAlign: 'right', padding: '16px 0', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: 'Oct 15, 2025', desc: 'Pro Plan — Annual', amount: '₦120,000' },
                  { date: 'Oct 15, 2024', desc: 'Pro Plan — Annual', amount: '₦120,000' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i === 1 ? 'none' : '1px solid #F0EDF8' }}>
                    <td style={{ padding: '16px 0', fontSize: '14px', color: 'var(--ink)' }}>{row.date}</td>
                    <td style={{ padding: '16px 0', fontSize: '14px', color: 'var(--ink)' }}>{row.desc}</td>
                    <td style={{ padding: '16px 0', fontSize: '14px', color: 'var(--ink)', textAlign: 'right', fontWeight: 600 }}>{row.amount}</td>
                    <td style={{ padding: '16px 0', textAlign: 'right' }}>
                      <button style={{ background: 'none', border: 'none', color: 'var(--purple-600)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Download PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default MembershipBilling;
