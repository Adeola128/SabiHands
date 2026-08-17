import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImage } from '../../lib/uploadImage';
import { toast } from 'react-hot-toast';
import LoadingScreen from '../../components/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
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
  const [showSuccess, setShowSuccess] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pitch, setPitch] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      const [gigResult, profileResult, questionsResult] = await Promise.all([
        supabase.from('gigs').select('*, organizations(user_id, name)').eq('id', id).single(),
        supabase.from('volunteer_profiles').select('full_name').eq('user_id', user.id).single(),
        supabase.from('gig_questions').select('*').eq('gig_id', id)
      ]);
      if (gigResult.data) setGig(gigResult.data);
      if (profileResult.data) setProfile(profileResult.data);
      if (questionsResult.data) {
        setQuestions(questionsResult.data);
        const initAnswers: Record<string, string> = {};
        questionsResult.data.forEach(q => initAnswers[q.id] = '');
        setAnswers(initAnswers);
      }
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
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) setPreviewUrl(URL.createObjectURL(file));
      else setPreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) setPreviewUrl(URL.createObjectURL(file));
      else setPreviewUrl(null);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setIsSubmitting(true);
    setError(null);
    
    try {
      let cv_url = null;
      if (selectedFile) {
        cv_url = await uploadImage(selectedFile, 'resumes');
      }

      const { data: appData, error: insertError } = await supabase
        .from('applications')
        .insert({
          gig_id: id,
          volunteer_id: user.id,
          status: 'pending',
          pitch: gig?.pitch_requirement !== 'off' ? pitch : null,
          resume_url: cv_url,
          linkedin_url: gig?.linkedin_requirement !== 'off' ? linkedin : null,
          portfolio_url: gig?.portfolio_requirement !== 'off' ? portfolio : null
        })
        .select()
        .single();
        
      if (insertError) throw insertError;

      if (questions.length > 0) {
        const answersToInsert = questions.map(q => ({
          application_id: appData.id,
          question_id: q.id,
          answer_text: answers[q.id] || ''
        }));
        const { error: ansError } = await supabase.from('application_answers').insert(answersToInsert);
        if (ansError) throw ansError;
      }
      
      toast.success("Application submitted successfully!");
      setShowSuccess(true);
    } catch (err: any) {
      if (err.code === '23505') {
        const msg = "You have already applied for this gig and it is currently active.";
        toast.error(msg);
        setError(msg);
      } else {
        toast.error(err.message || 'Failed to submit application');
        setError(err.message || 'Failed to submit application');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="apply-page-wrapper">
      <div className="apply-bg-gradient"></div>
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
            <div className="gig-summary-cover" style={{ backgroundImage: `url(${gig?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig?.title || 'Gig')}&background=random&size=400`})` }}></div>
            <div className="gig-summary-body">
              <h3 className="gig-summary-title">{gig?.title}</h3>
              
              <div className="gig-summary-org">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(gig?.organizations?.name || 'Org')}&background=random`} alt={gig?.organizations?.name} />
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
                    <span className="summary-detail-value">
                      {[
                        gig?.resume_requirement === 'required' ? 'Resume' : null,
                        gig?.portfolio_requirement === 'required' ? 'Portfolio' : null,
                        gig?.linkedin_requirement === 'required' ? 'LinkedIn' : null,
                      ].filter(Boolean).join(', ') || 'None specified'}
                    </span>
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

            {gig?.pitch_requirement !== 'off' && (
              <div className="apply-form-section">
                <h2 className="form-section-title">
                  <span>2</span> Your Pitch
                </h2>
                
                <div className="apply-input-group">
                  <label className="apply-label">Why are you a great fit for this role? {gig?.pitch_requirement === 'optional' ? <span>(Optional)</span> : <span>(Required)</span>}</label>
                  <textarea 
                    className="apply-textarea" 
                    placeholder="Tell the organization about your relevant experience and why you're passionate about their cause..."
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    required={gig?.pitch_requirement === 'required'}
                  ></textarea>
                </div>
              </div>
            )}

            {(gig?.resume_requirement !== 'off' || gig?.linkedin_requirement !== 'off' || gig?.portfolio_requirement !== 'off') && (
              <div className="apply-form-section">
                <h2 className="form-section-title">
                  <span>3</span> Resume & Links
                </h2>
                
                {gig?.resume_requirement !== 'off' && (
                  <div className="apply-input-group">
                    <label className="apply-label">Upload Resume/CV {gig?.resume_requirement === 'optional' ? <span>(Optional)</span> : <span>(Required)</span>}</label>
                    
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
                          accept=".pdf,.doc,.docx,image/*"
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
                        {previewUrl ? (
                          <div style={{ width: '60px', height: '60px', borderRadius: '10px', backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, border: '1px solid #E4E1F5' }} />
                        ) : (
                          <svg className="file-info-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        )}
                        <div className="file-info">
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
                )}

                {gig?.linkedin_requirement !== 'off' && (
                  <div className="apply-input-group">
                    <label className="apply-label">LinkedIn Profile {gig?.linkedin_requirement === 'optional' ? <span>(Optional)</span> : <span>(Required)</span>}</label>
                    <input type="url" className="apply-input" placeholder="https://linkedin.com/in/yourprofile" value={linkedin} onChange={e => setLinkedin(e.target.value)} required={gig?.linkedin_requirement === 'required'} />
                  </div>
                )}
                
                {gig?.portfolio_requirement !== 'off' && (
                  <div className="apply-input-group">
                    <label className="apply-label">Portfolio / Website {gig?.portfolio_requirement === 'optional' ? <span>(Optional)</span> : <span>(Required)</span>}</label>
                    <input type="url" className="apply-input" placeholder="https://yourwebsite.com" value={portfolio} onChange={e => setPortfolio(e.target.value)} required={gig?.portfolio_requirement === 'required'} />
                  </div>
                )}
              </div>
            )}

            {questions.length > 0 && (
              <div className="apply-form-section">
                <h2 className="form-section-title">
                  <span>4</span> Organization Questions
                </h2>
                
                {questions.map((q) => (
                  <div className="apply-input-group" key={q.id}>
                    <label className="apply-label">{q.question_text} {!q.is_required && <span>(Optional)</span>}{q.is_required && <span>(Required)</span>}</label>
                    <input 
                      type="text" 
                      className="apply-input" 
                      placeholder="Your answer..." 
                      value={answers[q.id] || ''} 
                      onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} 
                      required={q.is_required} 
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="apply-actions">
              <Link to="/dashboard/volunteer/gigs" className="apply-cancel-btn">Cancel</Link>
              <button type="submit" className="apply-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
      )}
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="success-card"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              >
                <CheckCircle size={80} color="var(--teal-500)" strokeWidth={1.5} />
              </motion.div>
              <h2>Application Submitted!</h2>
              <p>You're one step closer to making an impact. The organization will review your profile shortly.</p>
              <button onClick={() => navigate('/dashboard/volunteer/applications')}>
                Return to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplyGig;
