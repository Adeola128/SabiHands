import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import LoadingScreen from '../../components/LoadingScreen';
import { uploadImage } from '../../lib/uploadImage';
import { UploadCloud, Link as LinkIcon, FileText, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SubmitWork: React.FC = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [content, setContent] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      if (!applicationId || !user) return;
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          gigs (*, organizations(name))
        `)
        .eq('id', applicationId)
        .eq('volunteer_id', user.id)
        .single();
      
      if (error || !data) {
        toast.error("Application not found.");
        navigate('/dashboard/volunteer/my-gigs');
        return;
      }
      setApplication(data);

      // Check if submission already exists
      const { data: existingSub } = await supabase
        .from('submissions')
        .select('*')
        .eq('application_id', applicationId)
        .single();

      if (existingSub) {
        setContent(existingSub.content || '');
        setDriveLink(existingSub.drive_link || '');
        setFileUrls(existingSub.file_urls || []);
      }

      setLoading(false);
    };

    fetchApp();
  }, [applicationId, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formats = application?.gigs?.submission_formats || ['text'];
    
    if (formats.includes('text') && !content.trim() && formats.length === 1) {
      toast.error("Please provide a description of your work.");
      return;
    }
    if (formats.includes('link') && !driveLink.trim() && formats.length === 1) {
      toast.error("Please provide a link to your work.");
      return;
    }
    if (formats.includes('file') && fileUrls.length === 0 && formats.length === 1) {
      toast.error("Please upload at least one file.");
      return;
    }
    if (!content.trim() && !driveLink.trim() && fileUrls.length === 0) {
      toast.error("Please provide at least one form of submission (file, link, or text).");
      return;
    }
    
    setSubmitting(true);
    try {
      const { data: existingSub } = await supabase
        .from('submissions')
        .select('id, status')
        .eq('application_id', applicationId)
        .single();
        
      if (existingSub && existingSub.status !== 'pending') {
         toast.error("This submission has already been reviewed.");
         setSubmitting(false);
         return;
      }

      if (existingSub) {
        // Update existing
        const { error } = await supabase
          .from('submissions')
          .update({ content, drive_link: driveLink, file_urls: fileUrls })
          .eq('id', existingSub.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('submissions')
          .insert({
            application_id: applicationId,
            volunteer_id: user?.id,
            gig_id: application.gig_id,
            content,
            drive_link: driveLink,
            file_urls: fileUrls
          });
        if (error) throw error;
      }
      
      toast.success("Work submitted successfully! The organization will review it.");
      navigate('/dashboard/volunteer/my-gigs');
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit work.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading submission details..." />;
  if (!application) return null;

  return (
    <>
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>Gig Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '2px' }}>Role</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.4 }}>{application.gigs?.title}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '2px' }}>Organization</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.4 }}>{application.gigs?.organizations?.name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Link to="/dashboard/volunteer/my-gigs" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to My Gigs
        </Link>
      </aside>

      <div className="main-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 60 }}>
          <div className="dash-card">
            <div className="dash-card-padding">
              <h1 style={{ fontSize: '24px', fontFamily: 'var(--display)', color: 'var(--ink)', marginBottom: '8px', letterSpacing: '-0.02em' }}>Submit Your Work</h1>
              <p style={{ fontSize: '15px', color: 'var(--body)', lineHeight: 1.6, marginBottom: '24px' }}>
                Please provide your completed work based on the organization's requirements below.
              </p>

              {application.gigs?.submission_notes && (
                <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Instructions from Organization</div>
                  <div style={{ fontSize: '14px', color: '#0C4A6E', lineHeight: 1.5 }}>{application.gigs.submission_notes}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {(!application.gigs?.submission_formats || application.gigs.submission_formats.includes('file')) && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                      File Uploads
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {fileUrls.map((url, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#FAFAFC', border: '1px solid #E4E1F5', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <FileText size={16} color="var(--purple-600)" flexShrink={0} />
                            <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: 'var(--purple-600)', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              File {i + 1}
                            </a>
                          </div>
                          <button type="button" onClick={() => setFileUrls(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#E11D48', cursor: 'pointer', padding: '4px' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#FAFAFC', border: '2px dashed #D1CEDF', borderRadius: '12px', cursor: uploadingFiles ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: uploadingFiles ? 0.6 : 1 }}>
                        <UploadCloud size={24} color="var(--purple-600)" style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--purple-600)' }}>{uploadingFiles ? 'Uploading...' : 'Click to upload files'}</span>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Supports images, PDFs, and documents</span>
                        <input 
                          type="file" 
                          multiple
                          disabled={uploadingFiles}
                          onChange={async (e) => {
                            if (!e.target.files || e.target.files.length === 0) return;
                            setUploadingFiles(true);
                            try {
                              const newUrls = [];
                              for (let i = 0; i < e.target.files.length; i++) {
                                const url = await uploadImage(e.target.files[i], 'submissions');
                                newUrls.push(url);
                              }
                              setFileUrls(prev => [...prev, ...newUrls]);
                            } catch (err: any) {
                              toast.error("Failed to upload file(s): " + err.message);
                            } finally {
                              setUploadingFiles(false);
                            }
                          }}
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>
                  </div>
                )}

                {(!application.gigs?.submission_formats || application.gigs.submission_formats.includes('link')) && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                      External Link (Google Drive, Figma, GitHub, etc)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <LinkIcon size={18} color="var(--muted)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
                      <input
                        type="url"
                        value={driveLink}
                        onChange={(e) => setDriveLink(e.target.value)}
                        placeholder="https://"
                        style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '15px', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                )}

                {(!application.gigs?.submission_formats || application.gigs.submission_formats.includes('text')) && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                      Text Description / Notes
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={6}
                      placeholder="Write your submission notes here..."
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '15px', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <Link to="/dashboard/volunteer/my-gigs" style={{ padding: '12px 24px', backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--ink)', fontWeight: 600, textDecoration: 'none' }}>
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ padding: '12px 24px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Work'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SubmitWork;
