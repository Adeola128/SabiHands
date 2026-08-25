import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

const MyApplications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAppId, setWithdrawAppId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('applications')
        .select(`
          *,
          gigs (
            id,
            title,
            date_start,
            organizations (
              name
            )
          )
        `)
        .eq('volunteer_id', user.id)
        .neq('status', 'accepted')
        .order('applied_at', { ascending: false });
        
      if (data) setApplications(data);
      setLoading(false);
    };

    fetchApplications();
  }, [user]);

  const handleConfirmWithdraw = async () => {
    if (!withdrawAppId) return;
    setProcessingId(withdrawAppId);
    
    const { error } = await supabase
      .from('applications')
      .update({ status: 'withdrawn' })
      .eq('id', withdrawAppId);
      
    if (!error) {
      setApplications(prev => prev.map(a => a.id === withdrawAppId ? { ...a, status: 'withdrawn' } : a));
      toast.success("Application withdrawn successfully.");
      setWithdrawModalOpen(false);
    } else {
      toast.error("Failed to withdraw application.");
    }
    
    setProcessingId(null);
    setWithdrawAppId(null);
  };

  return (
    <>
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '16px', marginBottom: '24px' }}>Status Filters</h2>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '12px', cursor: 'pointer' }}>
                <input type="radio" name="status" checked={filter === 'all'} onChange={() => setFilter('all')} style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> All Applications
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '12px', cursor: 'pointer' }}>
                <input type="radio" name="status" checked={filter === 'pending'} onChange={() => setFilter('pending')} style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> Pending Review
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '12px', cursor: 'pointer' }}>
                <input type="radio" name="status" checked={filter === 'withdrawn'} onChange={() => setFilter('withdrawn')} style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> Withdrawn
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="radio" name="status" checked={filter === 'declined'} onChange={() => setFilter('declined')} style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> Declined
              </label>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">My Applications</h2>
          </div>
          {loading ? (
            <LoadingScreen message="Loading applications..." fullScreen={false} />
          ) : applications.filter(app => filter === 'all' || app.status === filter).length === 0 ? (
            <EmptyState 
              icon={
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  {filter === 'pending' ? <Sparkles size={48} color="var(--purple-500)" /> : <Search size={48} color="var(--purple-500)" />}
                </motion.div>
              }
              title={filter === 'pending' ? "You're all caught up!" : "No Applications Found"}
              description={filter === 'pending' ? "The organizations are reviewing your awesome profile. While you wait, check out these similar gigs." : "You have no applications matching this filter. Ready to make an impact?"}
              actionButton={<Link to="/dashboard/volunteer/gigs" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: 'var(--purple-600)', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: 700, boxShadow: '0 4px 12px rgba(83,74,183,0.3)' }}>Explore More Gigs</Link>}
            />
          ) : (
            applications.filter(app => filter === 'all' || app.status === filter).map(app => (
              <div key={app.id} className="gig-media-card">
                <div className="gig-media-cover" style={{ backgroundImage: `url(${app.gigs?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.gigs?.title || 'Gig')}&background=random&size=800`})`, height: '120px' }}></div>
                <div className="gig-media-body">
                  <div className="gig-media-header">
                    <div>
                      <h3 className="gig-media-title">{app.gigs?.title}</h3>
                      <Link to={`/dashboard/organization/profile/${app.gigs?.organizations?.id}`} className="gig-media-org" style={{ textDecoration: 'none' }}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.gigs?.organizations?.name || 'Org')}&background=random`} alt={app.gigs?.organizations?.name} />
                        <strong>{app.gigs?.organizations?.name || 'Organization'}</strong>
                      </Link>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="tag status" style={{ backgroundColor: app.status === 'accepted' ? '#D4EDDA' : app.status === 'declined' ? '#F8D7DA' : app.status === 'withdrawn' ? '#E2E3E5' : '#FFF3CD', color: app.status === 'accepted' ? '#155724' : app.status === 'declined' ? '#721C24' : app.status === 'withdrawn' ? '#383D41' : '#856404', textTransform: 'capitalize' }}>
                        {app.status}
                      </span>
                      <div style={{ fontSize: '12px', color: 'var(--body)', marginTop: '8px' }}>
                        Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" }) : ''}
                      </div>
                    </div>
                  </div>
                  <p style={{ color: 'var(--body)', fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    {app.status === 'pending' && 'Your application has been received and is currently being reviewed by the organization. You will be notified once a decision has been made.'}
                    {app.status === 'accepted' && 'Congratulations! Your application has been approved. Please check your messages for onboarding instructions.'}
                    {app.status === 'declined' && 'Unfortunately, the organization decided to move forward with other candidates at this time.'}
                    {app.status === 'withdrawn' && 'You have withdrawn this application.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', marginBottom: '24px', padding: '16px', backgroundColor: '#FAFAFC', borderRadius: '12px', border: '1px solid #E4E1F5' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--purple-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div style={{ height: '2px', flex: 1, backgroundColor: 'var(--purple-600)', marginLeft: '4px' }}></div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Applied</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", month: 'short', day: 'numeric' }) : ''}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: (app.status !== 'withdrawn') ? 'var(--purple-600)' : '#E4E1F5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                           {(app.status === 'accepted' || app.status === 'declined') ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }}></div>}
                        </div>
                        <div style={{ height: '2px', flex: 1, backgroundColor: (app.status === 'accepted' || app.status === 'declined') ? 'var(--purple-600)' : '#E4E1F5', marginLeft: '4px' }}></div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: (app.status !== 'withdrawn') ? 'var(--ink)' : 'var(--muted)' }}>Under Review</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Organization viewing</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 0.3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: app.status === 'accepted' ? '#10B981' : app.status === 'declined' ? '#EF4444' : app.status === 'withdrawn' ? '#6B7280' : '#E4E1F5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {(app.status === 'accepted' || app.status === 'declined' || app.status === 'withdrawn') && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: (app.status === 'accepted' || app.status === 'declined' || app.status === 'withdrawn') ? 'var(--ink)' : 'var(--muted)' }}>Decision</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{app.status === 'accepted' ? 'Accepted' : app.status === 'declined' ? 'Declined' : app.status === 'withdrawn' ? 'Withdrawn' : 'Pending'}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Link to={`/dashboard/volunteer/gigs/${app.gigs?.id}`} className="gig-action" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>View Gig Details</Link>
                    {(app.status === 'pending' || app.status === 'accepted') && (
                      <button 
                        onClick={() => { setWithdrawAppId(app.id); setWithdrawModalOpen(true); }} 
                        className="gig-action" 
                        disabled={app.gigs?.date_start && new Date(app.gigs.date_start) < new Date()}
                        style={{ 
                          background: 'none', 
                          border: '1.5px solid #E4E1F5', 
                          color: (app.gigs?.date_start && new Date(app.gigs.date_start) < new Date()) ? 'var(--muted)' : 'var(--body)',
                          opacity: (app.gigs?.date_start && new Date(app.gigs.date_start) < new Date()) ? 0.5 : 1,
                          cursor: (app.gigs?.date_start && new Date(app.gigs.date_start) < new Date()) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

        </div>
      </div>
      
      <ConfirmModal 
        isOpen={withdrawModalOpen}
        title="Withdraw Application"
        message="Are you sure you want to withdraw your application? This action cannot be undone."
        confirmText="Withdraw"
        onConfirm={handleConfirmWithdraw}
        onCancel={() => {
          setWithdrawModalOpen(false);
          setWithdrawAppId(null);
        }}
        isProcessing={processingId === withdrawAppId}
      />
    </>
  );
};

export default MyApplications;
