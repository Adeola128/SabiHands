import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImage } from '../../lib/uploadImage';
import { toast } from 'react-hot-toast';
import LoadingScreen from '../../components/LoadingScreen';
import './ApplyGig.css';

const ApplyGig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [gig, setGig] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pitch, setPitch] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      try {
        const { data: gigResult, error: gigError } = await supabase
          .from('gigs')
          .select('*, organizations(user_id, name, logo_url)')
          .or(`id.eq.${id},slug.eq.${id}`)
          .single();

        if (gigError) throw gigError;
        setGig(gigResult);

        const [profileResult, questionsResult] = await Promise.all([
          supabase.from('volunteer_profiles').select('full_name, phone_number').eq('user_id', user.id).single(),
          supabase.from('gig_questions').select('*').eq('gig_id', gigResult.id)
        ]);

        if (profileResult.data) setProfile(profileResult.data);
        if (questionsResult.data) {
          setQuestions(questionsResult.data);
          const initAnswers: Record<string, string> = {};
          questionsResult.data.forEach(q => initAnswers[q.id] = '');
          setAnswers(initAnswers);
        }
      } catch (err: any) {
        console.error("Error fetching gig:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !gig?.id) return;
    setIsSubmitting(true);
    
    try {
      let cv_url = null;
      if (selectedFile) {
        cv_url = await uploadImage(selectedFile, 'resumes');
      }

      const { data: appData, error: insertError } = await supabase
        .from('applications')
        .insert({
          gig_id: gig.id,
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
      
      setShowSuccess(true);
    } catch (err: any) {
      if (err.code === '23505') {
        toast.error("You have already applied for this gig.");
      } else {
        toast.error(err.message || 'Failed to submit application');
      }
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading..." fullScreen={true} />;
  
  if (!gig) {
    return (
      <div className="apply-page-wrapper">
        <div style={{ padding: '80px', textAlign: 'center' }}>
          <h2>Gig not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-page-wrapper">
      
      <nav className="apply-nav">
        <div className="apply-nav-inner">
          <svg className="apply-nav-mark" viewBox="0 0 100 100"><path d="M20 15 L75 50" fill="none" stroke="#7F77DD" strokeWidth="16" strokeLinecap="round"/><path d="M20 85 L75 50" fill="none" stroke="#1D9E75" strokeWidth="16" strokeLinecap="round"/></svg>
          <span className="apply-nav-name">Ralvo</span>
          <Link to={`/gig/${gig.slug || gig.id}`} className="apply-nav-back">← Back to gig</Link>
        </div>
      </nav>

      <div className="apply-layout">

        {/* Left column: Gig Summary */}
        <aside className="gig-card">
          <div className="org">
            {gig.organizations?.logo_url && <img src={gig.organizations.logo_url} alt={gig.organizations?.name} />}
            Posted by {gig.organizations?.name || 'Organization'}
          </div>
          <h1>{gig.title}</h1>

          <div className="gig-meta">
            <div className="gig-meta-row">
              <span className="dot" style={{ background: '#7F77DD' }}></span>
              <div><span className="label">Type</span><span className="value">{gig.type === 'skilled' ? 'Skilled' : 'Physical'}</span></div>
            </div>
            <div className="gig-meta-row">
              <span className="dot" style={{ background: '#1D9E75' }}></span>
              <div><span className="label">Location</span><span className="value">{gig.location || 'Remote'}</span></div>
            </div>
            <div className="gig-meta-row">
              <span className="dot" style={{ background: '#5DCAA5' }}></span>
              <div><span className="label">Commitment</span><span className="value">{gig.hours_required ? `${gig.hours_required} Hours` : 'Flexible'}</span></div>
            </div>
          </div>

          <p className="gig-desc" style={{ whiteSpace: 'pre-wrap' }}>{gig.description}</p>
        </aside>

        {/* Right column: Application Form */}
        <main className="form-card">
          {!showSuccess ? (
            <div id="form-view">
              <h2>Apply for this gig</h2>
              <p className="lede">Takes about 3 minutes. Organizations typically review applications within a few days.</p>

              <form onSubmit={handleSubmit} noValidate>

                <div className="fieldset">
                  <div className="fieldset-title">Your details</div>
                  <div className="apply-row">
                    <div className="field">
                      <label htmlFor="f-name">Full name</label>
                      <input type="text" id="f-name" value={profile?.full_name || user?.user_metadata?.full_name || ''} disabled />
                    </div>
                    <div className="field">
                      <label htmlFor="f-email">Email address</label>
                      <input type="email" id="f-email" value={user?.email || ''} disabled />
                    </div>
                  </div>
                </div>

                {gig?.pitch_requirement !== 'off' && (
                  <div className="fieldset">
                    <div className="fieldset-title">Tell {gig.organizations?.name || 'them'} about you</div>
                    <div className="field">
                      <label htmlFor="f-why">
                        Why does this gig interest you? 
                        {gig?.pitch_requirement === 'optional' && <span className="optional">Optional</span>}
                      </label>
                      <textarea 
                        id="f-why" 
                        maxLength={500} 
                        placeholder="A couple of sentences is plenty." 
                        required={gig?.pitch_requirement === 'required'}
                        value={pitch}
                        onChange={(e) => setPitch(e.target.value)}
                      ></textarea>
                      <div className="char-count">{pitch.length}/500</div>
                    </div>
                  </div>
                )}

                {(gig?.resume_requirement !== 'off' || gig?.linkedin_requirement !== 'off' || gig?.portfolio_requirement !== 'off') && (
                  <div className="fieldset">
                    <div className="fieldset-title">Links & Attachments</div>
                    
                    {gig?.portfolio_requirement !== 'off' && (
                      <div className="field">
                        <label htmlFor="f-portfolio">
                          Portfolio or writing sample 
                          {gig?.portfolio_requirement === 'optional' && <span className="optional">Optional</span>}
                        </label>
                        <input 
                          type="url" 
                          id="f-portfolio" 
                          placeholder="https://..." 
                          value={portfolio}
                          onChange={(e) => setPortfolio(e.target.value)}
                          required={gig?.portfolio_requirement === 'required'}
                        />
                        <p className="help">A link to anything you've built, written, or created.</p>
                      </div>
                    )}
                    
                    {gig?.linkedin_requirement !== 'off' && (
                      <div className="field">
                        <label htmlFor="f-linkedin">
                          LinkedIn Profile 
                          {gig?.linkedin_requirement === 'optional' && <span className="optional">Optional</span>}
                        </label>
                        <input 
                          type="url" 
                          id="f-linkedin" 
                          placeholder="https://linkedin.com/in/..." 
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          required={gig?.linkedin_requirement === 'required'}
                        />
                      </div>
                    )}

                    {gig?.resume_requirement !== 'off' && (
                      <div className="field">
                        <label>
                          Attach a résumé 
                          {gig?.resume_requirement === 'optional' && <span className="optional">Optional</span>}
                        </label>
                        
                        {!selectedFile ? (
                          <label 
                            className={`file-drop ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            <input 
                              type="file" 
                              id="f-file" 
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                            />
                            <div className="fd-text">Click to upload or drag & drop</div>
                            <div className="fd-sub">PDF or DOCX, up to 5MB</div>
                          </label>
                        ) : (
                          <div className="file-selected">
                            <div className="file-info">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                              <div className="file-info-text">
                                <span className="file-name">{selectedFile.name}</span>
                                <span className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                              </div>
                            </div>
                            <button type="button" className="file-remove-btn" onClick={() => setSelectedFile(null)}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {questions.length > 0 && (
                  <div className="fieldset">
                    <div className="fieldset-title">Organization Questions</div>
                    {questions.map((q) => (
                      <div className="field" key={q.id}>
                        <label>
                          {q.question_text}
                          {!q.is_required && <span className="optional">Optional</span>}
                        </label>
                        <input 
                          type="text" 
                          placeholder="Your answer..." 
                          value={answers[q.id] || ''} 
                          onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} 
                          required={q.is_required} 
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="consent">
                  <input type="checkbox" id="f-consent" required />
                  <label htmlFor="f-consent">
                    I consent to share my application details and profile with <strong>{gig.organizations?.name || 'the receiving organization'}</strong> for volunteer screening. I understand this data will be used to contact me regarding this opportunity, and I may withdraw my application or request data deletion at any time via my dashboard.
                  </label>
                </div>

                <div className="submit-row">
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <svg className="apply-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        Submitting...
                      </>
                    ) : (
                      <>Submit application →</>
                    )}
                  </button>
                  <p className="submit-note">You'll receive an email confirmation once the organization reviews your application.</p>
                </div>

              </form>
            </div>
          ) : (
            <div className="success-view">
              <div className="ic">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>
              </div>
              <h2>Application sent</h2>
              <p>{gig.organizations?.name || 'The organization'} has received your application for {gig.title}. You'll hear back from them shortly.</p>
              <Link to="/dashboard/volunteer/gigs" className="btn-secondary">Browse more gigs</Link>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default ApplyGig;
