import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';

const VolunteerDetailOrg: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMessaging, setIsMessaging] = useState(false);
  
  // Invite states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeGigs, setActiveGigs] = useState<any[]>([]);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      const { data } = await supabase
        .from('volunteer_profiles')
        .select('*')
        .eq('user_id', id)
        .single();
        
      if (data) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  // Fetch org's active gigs when invite modal opens
  const handleOpenInvite = async () => {
    if (!user || !id) return;
    setShowInviteModal(true);
    if (activeGigs.length > 0) return; // already fetched
    
    try {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (orgData) {
        const { data: gigs } = await supabase
          .from('gigs')
          .select('id, title, date_start')
          .eq('organization_id', orgData.id)
          .gte('date_start', new Date().toISOString())
          .order('date_start', { ascending: true });
          
        if (gigs) setActiveGigs(gigs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInvite = async (gigId: string) => {
    if (!user || !id) return;
    setIsInviting(true);
    try {
      const { error } = await supabase
        .from('invitations')
        .insert({
          gig_id: gigId,
          volunteer_id: id,
          status: 'pending'
        });
        
      if (error) {
        if (error.code === '23505') throw new Error("Already invited to this gig");
        throw error;
      }
      toast.success("Invitation sent successfully!");
      setShowInviteModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleMessageVolunteer = async () => {
    if (!user || !id) return;
    setIsMessaging(true);
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${id}),and(user1_id.eq.${id},user2_id.eq.${user.id})`)
        .limit(1);

      if (existing && existing.length > 0) {
        navigate('/dashboard/messages');
      } else {
        const { error } = await supabase
          .from('conversations')
          .insert({
            user1_id: user.id,
            user2_id: id
          });
        if (error) throw error;
        navigate('/dashboard/messages');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Rate limit')) {
        toast.error("You have reached your daily limit for new conversations.");
      } else {
        toast.error("Failed to start conversation.");
      }
    } finally {
      setIsMessaging(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading volunteer profile..." />;
  if (!profile) return (
    <EmptyState 
      icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
      title="Profile Not Found"
      description="The volunteer profile you are looking for does not exist or has been removed."
      actionButton={<Link to="/dashboard/org/gigs" className="apply-submit-btn" style={{ textDecoration: 'none' }}>Go Back</Link>}
    />
  );

  // Generate initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'V';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* â”€â”€ SIDEBAR â”€â”€ */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Volunteer Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={handleMessageVolunteer}
                disabled={isMessaging}
                style={{ width: '100%', padding: '10px 16px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', opacity: isMessaging ? 0.7 : 1 }}
              >
                {isMessaging ? 'Starting...' : 'Message Volunteer'}
              </button>
              <button 
                onClick={handleOpenInvite}
                style={{ width: '100%', padding: '10px 16px', backgroundColor: 'var(--paper)', color: 'var(--ink)', border: '1.5px solid #E4E1F5', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                Invite to Gig
              </button>
            </div>
          </div>
        </div>

        <button onClick={() => window.history.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Applicants
        </button>
      </aside>

      {/* â”€â”€ MAIN CONTENT â”€â”€ */}
      <div className="main-content">
        <div className="dash-card" style={{ marginBottom: '24px', position: 'relative' }}>
          <div style={{ height: '140px', backgroundColor: 'var(--purple-900)', borderRadius: '16px 16px 0 0', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          
          <div style={{ padding: '0 24px 24px', position: 'relative' }}>
            {/* Avatar */}
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', marginTop: '-50px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--purple-600)', color: 'white', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, fontFamily: 'var(--display)', marginTop: '-50px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                {getInitials(profile.full_name)}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)', margin: '0 0 4px' }}>{profile.full_name}</h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--muted)', marginTop: '12px' }}>
                  {profile.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {profile.location}
                    </span>
                  )}
                  {profile.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      {profile.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Verified badge - Default to true for now since we don't have identity verification system */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-700)', borderRadius: '99px', fontSize: '13px', fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Identity Verified
              </div>
            </div>

            {profile.bio && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E4E1F5' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>About</h3>
                <p style={{ fontSize: '14px', color: 'var(--body)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {profile.bio}
                </p>
              </div>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>Skills & Interests</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {profile.interests.map((sk: string) => (
                    <span key={sk} className="tag skilled">{sk}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Track Record - Empty State for now */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Ralvo Track Record</h2>
          </div>
          
          <div style={{ padding: '32px' }}>
            <EmptyState 
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}
              title="No Track Record Yet"
              description="This volunteer has not completed any gigs on Ralvo yet."
            />
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>Invite to Gig</h3>
            <p style={{ color: 'var(--body)', fontSize: '14px', marginBottom: '24px' }}>Select an active gig to invite {profile.full_name} to.</p>
            
            {activeGigs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--paper)', borderRadius: '8px' }}>
                <p style={{ color: 'var(--muted)' }}>You don't have any upcoming active gigs.</p>
                <Link to="/dashboard/org/gigs/new" style={{ color: 'var(--purple-600)', fontWeight: 600, textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>Create a Gig</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeGigs.map(gig => (
                  <div key={gig.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>{gig.title}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {gig.date_start ? new Date(gig.date_start).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" }) : 'TBD'}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleSendInvite(gig.id)}
                      disabled={isInviting}
                      style={{ padding: '8px 16px', backgroundColor: 'var(--teal-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', opacity: isInviting ? 0.7 : 1 }}
                    >
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button 
                onClick={() => setShowInviteModal(false)}
                style={{ padding: '10px 20px', border: '1px solid var(--border)', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VolunteerDetailOrg;

