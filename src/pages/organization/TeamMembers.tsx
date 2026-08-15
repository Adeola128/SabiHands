import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import LoadingScreen from '../../components/LoadingScreen';

const TeamMembers: React.FC = () => {
  const { user } = useAuth();
  const [showInvite, setShowInvite] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('manager');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!user) return;
      
      try {
        // 1. Find Organization
        let currentOrgId = null;
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id, user_id, name')
          .eq('user_id', user.id)
          .single();
          
        if (orgData) {
          currentOrgId = orgData.id;
        } else {
          // Check if they are a team member
          const { data: memData } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();
          if (memData) currentOrgId = memData.organization_id;
        }

        if (!currentOrgId) {
          setLoading(false);
          return;
        }
        
        setOrgId(currentOrgId);

        // 2. Fetch Members
        const { data: membersData, error } = await supabase
          .from('organization_members')
          .select('*, profiles:user_id(full_name, email)')
          .eq('organization_id', currentOrgId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Also add the owner to the list if not explicitly in the members table
        // Or we can just rely on the members table if we insert the owner there.
        // For now, let's just use what's in the members table, and we can manually push the owner if missing.
        let finalMembers = membersData || [];
        
        if (orgData) {
          const ownerExists = finalMembers.find(m => m.user_id === orgData.user_id);
          if (!ownerExists) {
             const { data: ownerProfile } = await supabase.from('profiles').select('*').eq('id', orgData.user_id).single();
             finalMembers.push({
                id: 'owner-id',
                organization_id: currentOrgId,
                user_id: orgData.user_id,
                role: 'owner',
                status: 'active',
                invited_email: ownerProfile?.email || 'owner@example.com',
                created_at: new Date().toISOString(),
                profiles: ownerProfile
             });
          }
        }
        
        setMembers(finalMembers);
      } catch (err) {
        console.error("Error fetching team:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [user]);

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error("Please enter a valid email address.");
      return;
    }
    
    setInviting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-org-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session?.access_token}`
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          organizationId: orgId
        })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || "Failed to invite member");
      }
      
      toast.success("Invitation sent successfully!");
      setShowInvite(false);
      setInviteEmail('');
      
      // Refresh members
      const { data: membersData } = await supabase
        .from('organization_members')
        .select('*, profiles:user_id(full_name, email)')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
        
      if (membersData) {
         setMembers(prev => {
            const owner = prev.find(p => p.role === 'owner');
            return owner ? [...membersData, owner] : membersData;
         });
      }
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading team..." />;

  const activeCount = members.filter(m => m.status === 'active').length;
  const pendingCount = members.filter(m => m.status === 'pending').length;

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Team Overview</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'var(--paper)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--purple-600)', fontFamily: 'var(--display)' }}>{activeCount}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px', textTransform: 'uppercase' }}>Members</div>
              </div>
              <div style={{ backgroundColor: 'var(--paper)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--teal-600)', fontFamily: 'var(--display)' }}>{pendingCount}</div>
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
                  <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@example.com" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', fontSize: '15px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</label>
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', fontSize: '15px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)', boxSizing: 'border-box' }}>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', backgroundColor: '#FAFAFC', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowInvite(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: 'var(--body)', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleInvite} disabled={inviting} style={{ padding: '10px 24px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: inviting ? 'not-allowed' : 'pointer', opacity: inviting ? 0.7 : 1 }}>
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        )}

        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Active Team Members</h2>
          </div>
          
          <div style={{ padding: '0 24px' }}>
            {members.map((m, i) => {
              const name = m.status === 'active' ? (m.profiles?.full_name || 'Member') : 'Pending Invite';
              const email = m.status === 'active' ? (m.profiles?.email || m.invited_email) : m.invited_email;
              const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
              
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: i < members.length - 1 ? '1px solid #E4E1F5' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: m.status === 'pending' ? '#F1F5F9' : 'var(--purple-100)', color: m.status === 'pending' ? '#94A3B8' : 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--display)' }}>
                      {m.status === 'pending' ? '?' : initials}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: m.status === 'pending' ? '#64748B' : 'var(--ink)', margin: '0' }}>{name}</h3>
                        {m.role === 'owner' && <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--teal-50)', color: 'var(--teal-700)', padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase' }}>Owner</span>}
                        {m.status === 'pending' && <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#FFFBEB', color: '#B45309', padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase' }}>Pending</span>}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '2px 0 0' }}>{email}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', textTransform: 'capitalize' }}>{m.role}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {m.status === 'pending' ? `Invited ${formatDistanceToNow(new Date(m.created_at))} ago` : `Active`}
                      </div>
                    </div>
                    
                    {m.role !== 'owner' && (
                      <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px', borderRadius: '6px' }} title="Manage user">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {members.length === 0 && (
               <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                 No team members found.
               </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default TeamMembers;
