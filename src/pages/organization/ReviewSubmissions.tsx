import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { generateSeoUrl } from '../../utils/url';
import LoadingScreen from '../../components/LoadingScreen';
import { motion } from 'framer-motion';
import { FileText, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

const ReviewSubmissions: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [gig, setGig] = useState<any>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!id || !user) return;
      
      const { data: gigData, error: gigError } = await supabase
        .from('gigs')
        .select('*, organizations(user_id)')
        .eq('id', id)
        .single();
        
      if (gigError || !gigData || gigData.organizations?.user_id !== user.id) {
        toast.error("Unauthorized or gig not found");
        navigate('/dashboard/org');
        return;
      }
      setGig(gigData);

      const { data: subData } = await supabase
        .from('submissions')
        .select(`
          *,
          applications (
            volunteer_id,
            volunteer_profiles (full_name, bio)
          )
        `)
        .eq('gig_id', id);

      if (subData) {
        setSubmissions(subData);
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, [id, user, navigate]);

  const handleApprove = async (submissionId: string, applicationId: string) => {
    try {
      // 1. Update submission status
      const { error: subErr } = await supabase
        .from('submissions')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', submissionId);
      if (subErr) throw subErr;

      // 2. Create attendance record to trigger certificate issuance
      // According to schema, inserting attendance with attended=true issues a cert.
      const { error: attErr } = await supabase
        .from('attendance')
        .insert({
          application_id: applicationId,
          confirmed_by: user?.id,
          attended: true,
          hours: gig.hours || 0
        });
        
      // If it fails with unique constraint (already exists), we update it instead.
      if (attErr) {
        if (attErr.code === '23505') { // Unique constraint
           await supabase
            .from('attendance')
            .update({ attended: true, confirmed_by: user?.id })
            .eq('application_id', applicationId);
        } else {
          throw attErr;
        }
      }

      toast.success("Submission approved and attendance marked!");
      setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status: 'approved' } : s));
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to approve submission.");
    }
  };

  const handleReject = async (submissionId: string) => {
    const feedback = prompt("Optional: Provide feedback for why it needs changes.");
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: 'rejected', feedback, reviewed_at: new Date().toISOString() })
        .eq('id', submissionId);
      if (error) throw error;
      toast.success("Submission marked for changes.");
      setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status: 'rejected', feedback } : s));
    } catch (err: any) {
      toast.error("Failed to update submission.");
    }
  };

  if (loading) return <LoadingScreen message="Loading submissions..." />;

  const pending = submissions.filter(s => s.status === 'pending');
  const reviewed = submissions.filter(s => s.status !== 'pending');

  return (
    <>
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>About this Gig</h3>
            <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>{gig.title}</h4>
            <p style={{ fontSize: '13px', color: 'var(--body)' }}>Review work submitted by volunteers for this remote/skilled gig.</p>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>Next Steps</h3>
            <p style={{ fontSize: '13px', color: 'var(--body)', margin: '0 0 16px' }}>Once you have approved submissions, you can generate and issue customized certificates for the volunteers.</p>
            <Link to={`/dashboard/org/gigs/${id}/certificates`} style={{ display: 'flex', justifyContent: 'center', padding: '10px 16px', backgroundColor: 'var(--purple-600)', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}>
              Issue Certificates →
            </Link>
          </div>
        </div>

        <Link to={`/dashboard/org/gigs/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Gig Details
        </Link>
      </aside>

      <div className="main-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 60 }}>
          <div className="dash-card" style={{ marginBottom: '24px' }}>
            <div className="dash-card-header">
              <h2 className="dash-card-title">Pending Submissions ({pending.length})</h2>
            </div>
            {pending.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>No pending submissions.</div>
            ) : (
              pending.map(sub => (
                <div key={sub.id} style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>
                        <Link to={`/volunteer/${generateSeoUrl(sub.applications?.volunteer_profiles?.full_name || 'volunteer', sub.applications?.volunteer_id)}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                          {sub.applications?.volunteer_profiles?.full_name}
                        </Link>
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>Submitted on {new Date(sub.submitted_at).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" })}</p>
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', backgroundColor: 'var(--paper)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.05em' }}>Submission Materials</h4>
                    
                    {sub.content && (
                      <div style={{ marginBottom: (sub.file_urls?.length > 0 || sub.drive_link) ? '16px' : '0' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>Notes / Description</div>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5 }}>
                          {sub.content}
                        </p>
                      </div>
                    )}

                    {sub.drive_link && (
                      <div style={{ marginBottom: sub.file_urls?.length > 0 ? '16px' : '0' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>External Link</div>
                        <a href={sub.drive_link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--purple-600)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                          <LinkIcon size={14} />
                          {sub.drive_link}
                        </a>
                      </div>
                    )}

                    {sub.file_urls && sub.file_urls.length > 0 && (
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>Uploaded Files</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                          {sub.file_urls.map((url: string, i: number) => {
                            const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
                            return (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: '#fff', border: '1px solid #E4E1F5', borderRadius: '8px', textDecoration: 'none', color: 'var(--ink)', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--purple-400)'} onMouseOut={e => e.currentTarget.style.borderColor = '#E4E1F5'}>
                                {isImage ? <ImageIcon size={16} color="var(--purple-600)" /> : <FileText size={16} color="var(--purple-600)" />}
                                <span style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>File {i + 1}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleApprove(sub.id, sub.application_id)} style={{ padding: '10px 20px', backgroundColor: 'var(--teal-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                      Approve Submission
                    </button>
                    <button onClick={() => handleReject(sub.id)} style={{ padding: '10px 20px', backgroundColor: 'var(--white)', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                      Request Changes
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {reviewed.length > 0 && (
            <div className="dash-card">
              <div className="dash-card-header">
                <h2 className="dash-card-title">Reviewed Submissions</h2>
              </div>
              {reviewed.map(sub => (
                <div key={sub.id} style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>
                        <Link to={`/volunteer/${generateSeoUrl(sub.applications?.volunteer_profiles?.full_name || 'volunteer', sub.applications?.volunteer_id)}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                          {sub.applications?.volunteer_profiles?.full_name}
                        </Link>
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>Reviewed on {new Date(sub.reviewed_at).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" })}</p>
                    </div>
                    <span className="tag status" style={{ backgroundColor: sub.status === 'approved' ? '#D4EDDA' : '#F8D7DA', color: sub.status === 'approved' ? '#155724' : '#721C24', textTransform: 'capitalize' }}>
                      {sub.status}
                    </span>
                  </div>
                  {sub.feedback && (
                    <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--ink)' }}>
                      <strong>Feedback:</strong> {sub.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ReviewSubmissions;
