import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import LoadingScreen from '../../components/LoadingScreen';

const VolunteerInvitations: React.FC = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchInvitations = async () => {
      const { data } = await supabase
        .from('invitations')
        .select(`
          id,
          status,
          created_at,
          gigs (
            id,
            title,
            date_start,
            organizations (
              id,
              name
            )
          )
        `)
        .eq('volunteer_id', user.id)
        .order('created_at', { ascending: false });
        
      if (data) setInvitations(data);
      setLoading(false);
    };

    fetchInvitations();
  }, [user]);

  const handleAction = async (id: string, gigId: string, action: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: action })
        .eq('id', id);
        
      if (error) throw error;
      
      if (action === 'accepted' && user && gigId) {
        // Auto-enroll the volunteer into the gig
        const { error: appError } = await supabase
          .from('applications')
          .insert({
            gig_id: gigId,
            volunteer_id: user.id,
            status: 'accepted'
          });
          
        if (appError && appError.code !== '23505') {
          console.error("Auto-enroll error:", appError);
        }
      }
      
      setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status: action } : inv));
      toast.success(`Invitation ${action}!`);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} invitation`);
    }
  };

  if (loading) return <LoadingScreen message="Loading invitations..." fullScreen={false} />;

  const pending = invitations.filter(i => i.status === 'pending');
  const past = invitations.filter(i => i.status !== 'pending');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px', width: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--display)', color: 'var(--ink)', marginBottom: '8px' }}>Gig Invitations</h1>
        <p style={{ color: 'var(--body)' }}>Manage invitations from organizations asking you to join their gigs.</p>
      </div>

      <div className="dash-card" style={{ marginBottom: '32px' }}>
        <div className="dash-card-header">
          <h2 className="dash-card-title">Pending Invitations</h2>
        </div>
        <div style={{ padding: '0 24px 24px' }}>
          {pending.length === 0 ? (
             <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)' }}>
               You have no pending invitations.
             </div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {pending.map(inv => (
                 <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                   <div>
                     <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--ink)' }}>{inv.gigs?.title}</h3>
                     <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--body)' }}>
                       <Link to={`/organization/${inv.gigs?.organizations?.id}`} style={{ color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 600 }}>
                         {inv.gigs?.organizations?.name}
                       </Link>
                       <span>|</span>
                       <span>Date: {inv.gigs?.date_start ? new Date(inv.gigs.date_start).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" }) : 'TBD'}</span>
                     </div>
                   </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleAction(inv.id, inv.gigs?.id, 'declined')} style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Decline</button>
                      <button onClick={() => handleAction(inv.id, inv.gigs?.id, 'accepted')} style={{ padding: '8px 16px', backgroundColor: 'var(--teal-600)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Accept</button>
                    </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>

      {past.length > 0 && (
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Past Invitations</h2>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {past.map(inv => (
                 <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F8F9FA', border: '1px solid var(--border)', borderRadius: '12px', opacity: 0.8 }}>
                   <div>
                     <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: 'var(--ink)' }}>{inv.gigs?.title}</h3>
                     <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                       {inv.gigs?.organizations?.name}
                     </div>
                   </div>
                   <div>
                     <span style={{ padding: '4px 12px', backgroundColor: inv.status === 'accepted' ? '#D4EDDA' : '#F8D7DA', color: inv.status === 'accepted' ? '#155724' : '#721C24', borderRadius: '99px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                       {inv.status}
                     </span>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerInvitations;
