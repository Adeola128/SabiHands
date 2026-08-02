import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import './PostGig.css';

type Step = 1 | 2 | 3;

const PostGig: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState<Step>(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', type: 'skilled', category: '', description: '',
    location: '', date: '', time: '', duration: '', volunteers: '', skills: '', remote: false,
    coverImage: '/images/hero_illustration.png',
  });

  const update = (field: string, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePublish = async () => {
    if (!user) return;
    setIsPublishing(true);
    setError(null);

    try {
      // 1. Get the organization ID for the current user
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (orgError) throw new Error("Could not find organization profile");

      // 2. Parse date & time to a full timestamp
      let dateStart = null;
      let dateEnd = null;
      if (form.date) {
        const start = new Date(`${form.date}T${form.time || '09:00'}:00`);
        dateStart = start.toISOString();
        if (form.duration) {
          const end = new Date(start.getTime() + (parseInt(form.duration) * 60 * 60 * 1000));
          dateEnd = end.toISOString();
        }
      }

      // 3. Insert the gig
      const { error: insertError } = await supabase
        .from('gigs')
        .insert({
          organization_id: orgData.id,
          title: form.title,
          description: form.description,
          type: form.type,
          location: form.remote ? 'Remote' : form.location,
          date_start: dateStart,
          date_end: dateEnd,
          status: 'published'
        });

      if (insertError) throw insertError;

      // 4. Success, navigate to gigs list
      toast.success("Gig published successfully!");
      navigate('/dashboard/org/gigs');
    } catch (err: any) {
      toast.error(err.message || "Failed to publish gig");
      setError(err.message || "Failed to publish gig");
      setIsPublishing(false);
    }
  };

  const steps = [
    { n: 1, label: 'Basic Info', desc: 'Title, type, and description' },
    { n: 2, label: 'Logistics', desc: 'When, where, and who' },
    { n: 3, label: 'Review & Publish', desc: 'Preview your gig' },
  ];

  return (
    <div className="post-gig-container">
      
      {/* ── LEFT SIDEBAR (STICKY) ── */}
      <div className="post-gig-sidebar">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/org_posting_gig.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(38,33,92,0.85) 0%, rgba(38,33,92,0.98) 100%)' }} />
        
        <div style={{ position: 'relative', padding: '40px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Link to="/dashboard/org/gigs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, marginBottom: '48px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Cancel & Back
          </Link>

          <h1 style={{ fontSize: '28px', fontFamily: 'var(--display)', color: 'white', marginBottom: '8px', lineHeight: 1.2 }}>Create a New Gig</h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', marginBottom: '48px', lineHeight: 1.6 }}>Find the perfect volunteers to help your organization scale its impact.</p>

          {/* Vertical Stepper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {steps.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: i < steps.length - 1 ? '32px' : '0' }}>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', left: '15px', top: '32px', bottom: '8px', width: '2px', backgroundColor: step > s.n ? 'var(--teal-400)' : 'rgba(255,255,255,0.1)', zIndex: 0, transition: 'background-color 0.3s' }} />
                )}
                
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, transition: 'all 0.3s', backgroundColor: step > s.n ? 'var(--teal-400)' : step === s.n ? 'var(--purple-400)' : 'transparent', color: step >= s.n ? '#ffffff' : 'rgba(255,255,255,0.4)', border: step < s.n ? '2px solid rgba(255,255,255,0.2)' : 'none', zIndex: 1, boxShadow: step === s.n ? '0 0 0 4px rgba(127,119,221,0.2)' : 'none' }}>
                  {step > s.n ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg> : s.n}
                </div>
                
                <div style={{ paddingTop: '4px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: step >= s.n ? 'white' : 'rgba(255,255,255,0.5)', transition: 'color 0.3s', marginBottom: '4px' }}>{s.label}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', transition: 'color 0.3s' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Helper Tips */}
          <div style={{ marginTop: 'auto', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--teal-200)', marginBottom: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Quick Tip
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>
              {step === 1 && "A clear, exciting title and detailed description can increase your applications by up to 300%."}
              {step === 2 && "If the work doesn't require physical presence, marking it as 'Remote' opens it up to a nationwide talent pool."}
              {step === 3 && "Preview your gig card exactly as it will appear to volunteers in the marketplace before hitting publish."}
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT MAIN CONTENT ── */}
      <div className="post-gig-main">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ maxWidth: '640px' }}>
              <h2 style={{ fontSize: '24px', fontFamily: 'var(--display)', color: 'var(--ink)', marginBottom: '32px' }}>Basic Information</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gig Title <span style={{color: 'var(--purple-600)'}}>*</span></label>
                  <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Content Writer for Monthly Newsletter" style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '2px solid transparent', boxShadow: '0 0 0 1px #E4E1F5', fontSize: '16px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)', transition: 'all 0.2s' }} onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--purple-400)'} onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 1px #E4E1F5'} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gig Type <span style={{color: 'var(--purple-600)'}}>*</span></label>
                  <div className="post-gig-type-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    
                    <button onClick={() => update('type', 'skilled')} style={{ padding: '24px', borderRadius: '16px', border: `2px solid ${form.type === 'skilled' ? 'var(--purple-600)' : 'transparent'}`, boxShadow: form.type === 'skilled' ? '0 8px 20px rgba(83,74,183,0.1)' : '0 0 0 1px #E4E1F5', backgroundColor: form.type === 'skilled' ? 'var(--purple-50)' : 'var(--white)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: form.type === 'skilled' ? 'var(--purple-600)' : 'var(--paper)', color: form.type === 'skilled' ? 'white' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', transition: 'all 0.2s' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                      </div>
                      <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>Skilled Volunteer</div>
                      <div style={{ fontSize: '14px', color: 'var(--body)', lineHeight: 1.5 }}>Requires specific professional expertise or soft skills.</div>
                      {form.type === 'skilled' && <div style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--purple-600)' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                    </button>

                    <button onClick={() => update('type', 'physical')} style={{ padding: '24px', borderRadius: '16px', border: `2px solid ${form.type === 'physical' ? 'var(--purple-600)' : 'transparent'}`, boxShadow: form.type === 'physical' ? '0 8px 20px rgba(83,74,183,0.1)' : '0 0 0 1px #E4E1F5', backgroundColor: form.type === 'physical' ? 'var(--purple-50)' : 'var(--white)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: form.type === 'physical' ? 'var(--purple-600)' : 'var(--paper)', color: form.type === 'physical' ? 'white' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', transition: 'all 0.2s' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      </div>
                      <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>Physical Volunteer</div>
                      <div style={{ fontSize: '14px', color: 'var(--body)', lineHeight: 1.5 }}>Hands-on, in-person tasks like packing or event setup.</div>
                      {form.type === 'physical' && <div style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--purple-600)' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                    </button>

                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</label>
                  <select value={form.category} onChange={e => update('category', e.target.value)} style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '2px solid transparent', boxShadow: '0 0 0 1px #E4E1F5', fontSize: '16px', color: form.category ? 'var(--ink)' : 'var(--muted)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)', transition: 'all 0.2s', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%238B87B0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px top 50%', backgroundSize: '12px auto' }} onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--purple-400)'} onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 1px #E4E1F5'}>
                    <option value="" disabled>Select the most relevant category...</option>
                    {['Technology', 'Writing & Communications', 'Design', 'Education & Mentorship', 'Health & Medical', 'Environment', 'Events & Logistics', 'Finance & Legal', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cover Image</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                    {['/images/hero_illustration.png', '/images/diverse_gigs.png', '/images/automated_certificates.png', '/images/trust_safety.png'].map(img => (
                      <button key={img} onClick={() => update('coverImage', img)} style={{ height: '80px', borderRadius: '10px', backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', border: `3px solid ${form.coverImage === img ? 'var(--purple-600)' : 'transparent'}`, boxShadow: form.coverImage === img ? '0 4px 12px rgba(83,74,183,0.2)' : '0 0 0 1px #E4E1F5', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
                        {form.coverImage === img && <div style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', backgroundColor: 'var(--purple-600)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                      </button>
                    ))}
                    <button style={{ height: '80px', borderRadius: '10px', backgroundColor: '#FAFAFC', border: '1.5px dashed #D1CEDF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--purple-600)', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--purple-50)'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#FAFAFC'}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span style={{ fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>Upload</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gig Description <span style={{color: 'var(--purple-600)'}}>*</span></label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe the problem, what the volunteer will do, and the impact they will have..." rows={6} style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '2px solid transparent', boxShadow: '0 0 0 1px #E4E1F5', fontSize: '16px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', resize: 'vertical', lineHeight: 1.6, backgroundColor: 'var(--white)', transition: 'all 0.2s' }} onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--purple-400)'} onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 1px #E4E1F5'} />
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid #E4E1F5', paddingTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setStep(2)} style={{ padding: '14px 40px', backgroundColor: 'var(--purple-600)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(83,74,183,0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(83,74,183,0.4)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(83,74,183,0.3)'; }}>
                    Next: Logistics →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Logistics */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ maxWidth: '640px' }}>
              <h2 style={{ fontSize: '24px', fontFamily: 'var(--display)', color: 'var(--ink)', marginBottom: '32px' }}>Logistics & Requirements</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* Timeframe Card */}
                <div style={{ padding: '24px', backgroundColor: 'var(--white)', borderRadius: '16px', boxShadow: '0 0 0 1px #E4E1F5', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple-600)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Timeframe
                  </h3>
                  <div className="post-gig-logistics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
                      <input type="date" value={form.date} onChange={e => update('date', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', fontSize: '15px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: '#FAFAFC', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--purple-400)'} onBlur={e => e.currentTarget.style.borderColor = '#E4E1F5'} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Time</label>
                      <input type="time" value={form.time} onChange={e => update('time', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', fontSize: '15px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: '#FAFAFC', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--purple-400)'} onBlur={e => e.currentTarget.style.borderColor = '#E4E1F5'} />
                    </div>
                  </div>
                </div>

                <div className="post-gig-logistics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duration (hours)</label>
                    <input type="number" min="1" value={form.duration} onChange={e => update('duration', e.target.value)} placeholder="e.g. 4" style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '2px solid transparent', boxShadow: '0 0 0 1px #E4E1F5', fontSize: '16px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)', transition: 'all 0.2s' }} onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--purple-400)'} onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 1px #E4E1F5'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Volunteers Needed</label>
                    <input type="number" min="1" value={form.volunteers} onChange={e => update('volunteers', e.target.value)} placeholder="e.g. 5" style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '2px solid transparent', boxShadow: '0 0 0 1px #E4E1F5', fontSize: '16px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)', transition: 'all 0.2s' }} onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--purple-400)'} onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 1px #E4E1F5'} />
                  </div>
                </div>

                <div style={{ padding: '24px', backgroundColor: form.remote ? 'var(--teal-50)' : 'var(--white)', borderRadius: '16px', boxShadow: form.remote ? '0 0 0 2px var(--teal-400)' : '0 0 0 1px #E4E1F5', transition: 'all 0.3s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: form.remote ? '0' : '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: form.remote ? 'var(--teal-900)' : 'var(--ink)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={form.remote ? "var(--teal-600)" : "var(--purple-600)"} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      Location
                    </h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: form.remote ? 'var(--teal-700)' : 'var(--muted)' }}>Remote Gig</span>
                      <div style={{ width: '40px', height: '24px', borderRadius: '99px', backgroundColor: form.remote ? 'var(--teal-400)' : '#E4E1F5', position: 'relative', transition: 'background-color 0.3s' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '2px', left: form.remote ? '18px' : '2px', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                      </div>
                      <input type="checkbox" checked={form.remote} onChange={e => update('remote', e.target.checked)} style={{ display: 'none' }} />
                    </label>
                  </div>
                  
                  <AnimatePresence>
                    {!form.remote && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <input value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Elegushi Beach, Lekki, Lagos" style={{ width: '100%', padding: '16px 20px', borderRadius: '10px', border: '1.5px solid #E4E1F5', fontSize: '15px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: '#FAFAFC', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--purple-400)'} onBlur={e => e.currentTarget.style.borderColor = '#E4E1F5'} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skills Required (Optional)</label>
                  <input value={form.skills} onChange={e => update('skills', e.target.value)} placeholder="e.g. React, Node.js, Figma (comma separated)" style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '2px solid transparent', boxShadow: '0 0 0 1px #E4E1F5', fontSize: '16px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)', transition: 'all 0.2s' }} onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--purple-400)'} onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 1px #E4E1F5'} />
                  {form.skills && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {form.skills.split(',').filter(s => s.trim()).map((sk, i) => (
                        <span key={i} className="tag skilled">{sk.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid #E4E1F5', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setStep(1)} style={{ padding: '14px 24px', backgroundColor: 'var(--white)', color: 'var(--body)', border: '1px solid #E4E1F5', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FAFAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--white)'}>
                    ← Back
                  </button>
                  <button onClick={() => setStep(3)} style={{ padding: '14px 40px', backgroundColor: 'var(--purple-600)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(83,74,183,0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(83,74,183,0.4)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(83,74,183,0.3)'; }}>
                    Next: Review →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ maxWidth: '800px' }}>
              <h2 style={{ fontSize: '24px', fontFamily: 'var(--display)', color: 'var(--ink)', marginBottom: '8px' }}>Review & Publish</h2>
              <p style={{ fontSize: '15px', color: 'var(--body)', marginBottom: '32px' }}>This is exactly how your gig will appear to volunteers in the marketplace.</p>
              
              {error && <div style={{ padding: '12px', backgroundColor: 'var(--pink-50)', color: 'var(--pink-600)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>{error}</div>}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Live Preview Card */}
                <div style={{ padding: '24px', backgroundColor: 'var(--paper)', borderRadius: '16px', border: '1px dashed #D1CEDF' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', textAlign: 'center' }}>Live Preview</div>
                  
                  {/* Actual Gig Media Card Component rendering user data */}
                  <div className="gig-media-card-horizontal" style={{ backgroundColor: 'white', cursor: 'default', boxShadow: '0 10px 30px rgba(38,33,92,0.05)', border: 'none' }}>
                    <div className="gig-media-cover-horizontal" style={{ backgroundImage: `url(${form.coverImage})` }} />
                    <div className="gig-media-body-horizontal" style={{ padding: '24px' }}>
                      <div className="gig-media-header" style={{ marginBottom: '16px' }}>
                        <div>
                          <h3 className="gig-media-title" style={{ fontSize: '18px', marginBottom: '4px' }}>{form.title || 'Untitled Gig'}</h3>
                          <p className="gig-media-org" style={{ fontSize: '14px', margin: 0 }}>Slum2School Africa</p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <span className="tag skilled" style={{ backgroundColor: form.type === 'skilled' ? 'var(--purple-50)' : 'var(--teal-50)', color: form.type === 'skilled' ? 'var(--purple-600)' : 'var(--teal-700)' }}>{form.type === 'skilled' ? 'Skilled' : 'Physical'}</span>
                        {form.category && <span className="tag category">{form.category}</span>}
                        {form.remote && <span className="tag physical">Remote</span>}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', backgroundColor: '#FAFAFC', borderRadius: '12px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--body)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          <span style={{ fontWeight: 500 }}>{form.date || 'TBD'} • {form.time || 'TBD'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--body)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span style={{ fontWeight: 500 }}>{form.remote ? 'Remote' : (form.location || 'Location TBD')}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                          Need: <strong style={{ color: 'var(--ink)' }}>{form.volunteers || '0'}</strong>
                        </div>
                        <div style={{ padding: '8px 24px', backgroundColor: 'var(--purple-600)', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>Apply Now</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid #E4E1F5', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setStep(2)} style={{ padding: '14px 24px', backgroundColor: 'var(--white)', color: 'var(--body)', border: '1px solid #E4E1F5', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FAFAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--white)'}>
                    ← Edit Logistics
                  </button>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button style={{ padding: '14px 24px', backgroundColor: 'var(--white)', color: 'var(--ink)', border: '1px solid #E4E1F5', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FAFAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--white)'}>
                      Save Draft
                    </button>
                    <button disabled={isPublishing} onClick={handlePublish} style={{ padding: '14px 40px', background: 'linear-gradient(135deg, var(--teal-400), var(--teal-600))', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: isPublishing ? 'default' : 'pointer', boxShadow: '0 8px 24px rgba(29,158,117,0.3)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '8px', opacity: isPublishing ? 0.7 : 1 }} onMouseOver={e => { if(!isPublishing){ e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(29,158,117,0.4)';} }} onMouseOut={e => { if(!isPublishing){ e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(29,158,117,0.3)';} }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {isPublishing ? 'Publishing...' : 'Publish Gig'}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default PostGig;
