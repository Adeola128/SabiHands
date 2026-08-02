import React, { useState } from 'react';

const teamMembers = [
  { id: 1, name: 'Adeola Okonkwo', email: 'adeola@slum2school.org', role: 'Owner', lastActive: 'Just now', avatar: 'AO' },
  { id: 2, name: 'Babajide Sanwo', email: 'jide@slum2school.org', role: 'Admin', lastActive: '2 hrs ago', avatar: 'BS' },
  { id: 3, name: 'Chioma Eze', email: 'chioma@slum2school.org', role: 'Manager', lastActive: 'Yesterday', avatar: 'CE' },
];

const TeamMembers: React.FC = () => {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Team Overview</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'var(--paper)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--purple-600)', fontFamily: 'var(--display)' }}>3</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px', textTransform: 'uppercase' }}>Members</div>
              </div>
              <div style={{ backgroundColor: 'var(--paper)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--teal-600)', fontFamily: 'var(--display)' }}>1</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px', textTransform: 'uppercase' }}>Invited</div>
              </div>
            </div>

            <button onClick={() => setShowInvite(!showInvite)} style={{ width: '100%', padding: '10px 16px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Invite Member
            </button>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>Role Permissions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Owner</div>
                <div style={{ fontSize: '12px', color: 'var(--body)' }}>Full access including billing and deleting the organization.</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Admin</div>
                <div style={{ fontSize: '12px', color: 'var(--body)' }}>Can manage gigs, team members, and organization settings.</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Manager</div>
                <div style={{ fontSize: '12px', color: 'var(--body)' }}>Can post gigs and review applicants only.</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        {showInvite && (
          <div className="dash-card" style={{ marginBottom: '24px' }}>
            <div className="dash-card-padding" style={{ borderBottom: '1px solid #E4E1F5' }}>
              <h2 className="dash-card-title">Invite a New Team Member</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
                  <input placeholder="colleague@slum2school.org" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', fontSize: '15px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</label>
                  <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', fontSize: '15px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)' }}>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', backgroundColor: '#FAFAFC', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowInvite(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: 'var(--body)', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              <button style={{ padding: '10px 24px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Send Invitation</button>
            </div>
          </div>
        )}

        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Active Team Members</h2>
          </div>
          
          <div style={{ padding: '0 24px' }}>
            {teamMembers.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: i < teamMembers.length - 1 ? '1px solid #E4E1F5' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--display)' }}>
                    {m.avatar}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: '0' }}>{m.name}</h3>
                      {m.role === 'Owner' && <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--teal-50)', color: 'var(--teal-700)', padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase' }}>Owner</span>}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '2px 0 0' }}>{m.email}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{m.role}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Active: {m.lastActive}</div>
                  </div>
                  
                  {m.role !== 'Owner' && (
                    <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px', borderRadius: '6px' }} title="Edit user">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
};

export default TeamMembers;
