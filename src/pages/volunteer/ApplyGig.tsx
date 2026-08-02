import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import LoadingScreen from '../../components/LoadingScreen';
import './ApplyGig.css';

const ApplyGig: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [gig, setGig] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pitch, setPitch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      const [gigResult, profileResult] = await Promise.all([
        supabase.from('gigs').select('*, organizations(name)').eq('id', id).single(),
        supabase.from('volunteer_profiles').select('full_name').eq('user_id', user.id).single(),
      ]);
      if (gigResult.data) setGig(gigResult.data);
      if (profileResult.data) setProfile(profileResult.data);
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error: insertError } = await supabase
        .from('applications')
        .insert({
          gig_id: id,
          volunteer_id: user.id,
          status: 'pending'
        });
        
      if (insertError) throw insertError;
      
      toast.success("Application submitted successfully!");
      navigate('/dashboard/volunteer/applications');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application');
      setError(err.message || 'Failed to submit application');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="apply-container">
      <div className="apply-header">
        <h1 className="apply-title">Submit Application</h1>
        <p className="apply-subtitle">Review your details and tell the organization why you're a great fit.</p>
      </div>
      
      {error && <div style={{ padding: '12px', backgroundColor: 'var(--pink-50)', color: 'var(--pink-600)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>{error}</div>}
      
      {loading ? (
        <LoadingScreen message="Loading..." fullScreen={true} />
      ) : (
        <div className="apply-grid">
        {/* Left Column: Gig Context */}
        <div className="apply-context-col">
          <div className="gig-summary-card">
            <div className="gig-summary-cover" style={{ backgroundImage: 'url(/images/hero_illustration.png)' }}></div>
            <div className="gig-summary-body">
              <h3 className="gig-summary-title">{gig?.title}</h3>
              
              <div className="gig-summary-org">
                <img src="/images/diverse_gigs.png" alt={gig?.organizations?.name} />
                <strong>{gig?.organizations?.name || 'Organization'}</strong>
              </div>
              
              <div className="gig-summary-details">
                <div className="summary-detail-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <div className="summary-detail-content">
                    <span className="summary-detail-label">Location</span>
                    <span className="summary-detail-value">{gig?.location}</span>
                  </div>
                </div>
                
                <div className="summary-detail-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  <div className="summary-detail-content">
                    <span className="summary-detail-label">Commitment</span>
                    <span className="summary-detail-value">{gig?.type === 'skilled' ? 'Skilled' : 'Physical'}</span>
                  </div>
                </div>

                <div className="summary-detail-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <div className="summary-detail-content">
                    <span className="summary-detail-label">Requirements</span>
                    <span className="summary-detail-value">No specific requirements</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Application Form */}
        <div className="apply-form-col">
          <form onSubmit={handleSubmit}>
            
            <div className="apply-form-section">
              <h2 className="form-section-title">
                <span>1</span> Personal Details
              </h2>
              
              <div className="apply-input-group">
                <label className="apply-label">Full Name</label>
                <input type="text" className="apply-input" value={profile?.full_name || user?.user_metadata?.full_name || ''} disabled />
              </div>
              
              <div className="apply-input-group">
                <label className="apply-label">Email Address</label>
                <input type="email" className="apply-input" value={user?.email || ''} disabled />
              </div>
            </div>

            <div className="apply-form-section">
              <h2 className="form-section-title">
                <span>2</span> Your Pitch
              </h2>
              
              <div className="apply-input-group">
                <label className="apply-label">Why are you a great fit for this role? <span>(Required)</span></label>
                <textarea 
                  className="apply-textarea" 
                  placeholder="Tell the organization about your relevant experience and why you're passionate about their cause..."
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>

            <div className="apply-form-section">
              <h2 className="form-section-title">
                <span>3</span> Resume & Links
              </h2>
              
              <div className="apply-input-group">
                <label className="apply-label">Upload Resume/CV <span>(Optional)</span></label>
                
                {!selectedFile ? (
                  <div 
                    className={`file-upload-zone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    <input 
                      type="file" 
                      id="resume-upload" 
                      style={{ display: 'none' }} 
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    <div className="file-upload-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </div>
                    <div>
                      <p className="file-upload-text"><strong>Click to upload</strong> or drag and drop</p>
                      <p className="file-upload-subtext">PDF, DOCX up to 5MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="file-selected">
                    <div className="file-info">
                      <svg className="file-info-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      <div>
                        <p className="file-name">{selectedFile.name}</p>
                        <p className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button className="file-remove-btn" onClick={removeFile} title="Remove file">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="apply-input-group">
                <label className="apply-label">LinkedIn Profile <span>(Optional)</span></label>
                <input type="url" className="apply-input" placeholder="https://linkedin.com/in/yourprofile" />
              </div>
              
              <div className="apply-input-group">
                <label className="apply-label">Portfolio / Website <span>(Optional)</span></label>
                <input type="url" className="apply-input" placeholder="https://yourwebsite.com" />
              </div>
            </div>

            <div className="apply-actions">
              <Link to="/dashboard/volunteer/gigs" className="apply-cancel-btn">Cancel</Link>
              <button type="submit" className="apply-submit-btn" disabled={!pitch.trim() || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </button>
            </div>

          </form>
        </div>

      </div>
      )}
    </div>
  );
};

export default ApplyGig;
