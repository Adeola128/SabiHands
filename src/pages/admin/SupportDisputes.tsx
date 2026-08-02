import React from 'react';

const SupportDisputes: React.FC = () => {
  const tickets = [
    { id: 'TKT-1029', user: 'Chidi Okeke', type: 'Dispute', subject: 'Organization did not mark my attendance', status: 'Open', priority: 'High', date: '2 hrs ago' },
    { id: 'TKT-1028', user: 'Tech for Good Nigeria', type: 'Support', subject: 'How to change billing card?', status: 'Resolved', priority: 'Low', date: '1 day ago' },
    { id: 'TKT-1027', user: 'Adeola Okonkwo', type: 'Support', subject: 'Bug on profile page', status: 'In Progress', priority: 'Medium', date: '2 days ago' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Support & Disputes</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Handle tickets and conflicts between volunteers and organizations.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', fontWeight: 600, color: '#334155' }}>
            <option>All Tickets</option>
            <option>Open</option>
            <option>Resolved</option>
          </select>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject / User</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td><div style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>{ticket.id}</div></td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px' }}>{ticket.subject}</div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{ticket.user} &middot; {ticket.type}</div>
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: ticket.priority === 'High' ? '#DC2626' : ticket.priority === 'Medium' ? '#D97706' : '#64748B' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/></svg>
                      {ticket.priority}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-status-badge ${ticket.status === 'Resolved' ? 'admin-status-approved' : ticket.status === 'Open' ? 'admin-status-pending' : 'admin-status-rejected'}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>{ticket.date}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>Respond</button>
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

export default SupportDisputes;