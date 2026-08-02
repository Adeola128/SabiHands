import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GigCheckIn: React.FC = () => {
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">

        {/* Gig summary card */}
        <div className="dash-card" style={{ overflow: 'hidden' }}>
          <div style={{
            height: '120px',
            backgroundImage: 'url(/images/diverse_gigs.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(15,12,41,0.72) 100%)' }} />
          </div>
          <div className="dash-card-padding">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-900)', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', border: '1px solid var(--teal-200)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--teal-400)' }} />
              Check-in Open
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px', fontFamily: 'var(--display)', lineHeight: 1.3 }}>Beach Cleanup &amp; Awareness Drive</h3>
            <p style={{ fontSize: '13px', color: 'var(--body)', marginBottom: '0' }}>Lagos Green Initiative</p>
          </div>
        </div>

        {/* Event details card */}
        <div className="dash-card">
          <div className="dash-card-padding">
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>Event Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                {
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                  label: 'Date & Time', value: 'Sat, Aug 15 · 8:00 AM – 2:00 PM',
                },
                {
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                  label: 'Location', value: 'Elegushi Beach, Lekki, Lagos',
                },
                {
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
                  label: 'Your Role', value: 'General Volunteer',
                },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '2px' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.4 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Link to="/dashboard/volunteer/my-gigs" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to My Gigs
        </Link>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <AnimatePresence mode="wait">
          {!checkedIn ? (
            <motion.div
              key="check-in"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: 'spring', stiffness: 60 }}
            >
              {/* GPS Status card */}
              <div className="dash-card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{
                  background: 'linear-gradient(135deg, var(--teal-900) 0%, var(--teal-400) 100%)',
                  padding: '28px 24px',
                  position: 'relative',
                }}>
                  <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ position: 'absolute', bottom: '-30px', left: '8%', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.25)' }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>GPS Location</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'white', fontFamily: 'var(--display)', letterSpacing: '-0.01em' }}>Elegushi Beach, Lekki</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '6px' }}>
                        {/* Pulsing green dot */}
                        <div style={{ position: 'relative', width: '10px', height: '10px', flexShrink: 0 }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--teal-200)', boxShadow: '0 0 0 3px rgba(255,255,255,0.25)' }} />
                        </div>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.88)', fontWeight: 600 }}>Location verified · 0.2 km away</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Check-in main card */}
              <div className="dash-card">
                <div style={{ textAlign: 'center', padding: '40px 32px 32px' }}>
                  <h1 style={{ fontSize: '28px', fontFamily: 'var(--display)', color: 'var(--ink)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                    Confirm Your Attendance
                  </h1>
                  <p style={{ fontSize: '15px', color: 'var(--body)', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 32px' }}>
                    You're at the right place! Tap below to mark yourself as present for <strong>Beach Cleanup &amp; Awareness Drive</strong>.
                  </p>

                  {/* Volunteer identity card */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: 'var(--paper)', borderRadius: '14px', padding: '14px 18px', marginBottom: '28px', textAlign: 'left', border: '1px solid #E4E1F5' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: 700, fontFamily: 'var(--display)', flexShrink: 0 }}>
                      AO
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15px' }}>Adeola Okonkwo</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>General Volunteer · Accepted July 28</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--teal-600)', fontWeight: 700, flexShrink: 0, backgroundColor: 'var(--teal-50)', padding: '4px 10px', borderRadius: '99px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                      Verified
                    </div>
                  </div>

                  {/* CTA button */}
                  <button
                    onClick={() => setCheckedIn(true)}
                    style={{
                      width: '100%', maxWidth: '380px', padding: '16px 32px',
                      background: 'linear-gradient(135deg, var(--teal-400) 0%, var(--teal-600) 100%)',
                      color: '#ffffff', border: 'none', borderRadius: '12px',
                      fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 6px 20px -6px rgba(29,158,117,0.45)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px -6px rgba(15,110,86,0.55)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px -6px rgba(29,158,117,0.45)'; }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Confirm Check-In
                  </button>

                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '14px' }}>
                    Check-in window closes at <strong>9:00 AM</strong>
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 60 }}
            >
              <div className="dash-card" style={{ overflow: 'hidden' }}>
                {/* Success header */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--purple-900, #1E1B4B) 0%, var(--purple-600) 100%)',
                  padding: '52px 32px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(45,212,191,0.1)' }} />

                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 160, delay: 0.2 }}
                    style={{
                      position: 'relative', width: '76px', height: '76px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--teal-400) 0%, var(--teal-600) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px',
                      boxShadow: '0 12px 28px rgba(29,158,117,0.35)',
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  </motion.div>

                  <h1 style={{ fontSize: '30px', fontFamily: 'var(--display)', color: 'white', marginBottom: '10px', letterSpacing: '-0.02em', position: 'relative' }}>
                    You're checked in! 🎉
                  </h1>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: '380px', margin: '0 auto', position: 'relative' }}>
                    The organizer has been notified. Your hours will be confirmed at the end of the event.
                  </p>
                </div>

                {/* What happens next */}
                <div className="dash-card-padding">
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '24px' }}>What happens next?</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {[
                      { step: '1', title: 'Attend the event', body: 'Show up, do great work, and enjoy making an impact.', done: true },
                      { step: '2', title: 'Hours confirmed', body: 'The organizer marks your hours complete after the event.', done: false },
                      { step: '3', title: 'Certificate issued', body: 'Your SabiHands certificate is automatically generated and ready to share.', done: false },
                    ].map((item, idx, arr) => (
                      <div key={item.step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative', paddingBottom: idx < arr.length - 1 ? '24px' : '0' }}>
                        {/* Connecting line */}
                        {idx < arr.length - 1 && (
                          <div style={{ position: 'absolute', left: '15px', top: '32px', bottom: '0', width: '2px', backgroundColor: '#E4E1F5', zIndex: 0 }} />
                        )}
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: item.done ? 'var(--teal-600)' : 'var(--white)', border: item.done ? 'none' : '2px dashed #D1CEDF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                          {item.done
                            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                            : <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>{item.step}</span>
                          }
                        </div>
                        <div style={{ paddingTop: '5px' }}>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: item.done ? 'var(--ink)' : 'var(--body)', marginBottom: '3px' }}>{item.title}</div>
                          <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{item.body}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E4E1F5' }}>
                    <Link to="/dashboard/volunteer/my-gigs" className="gig-action" style={{ textDecoration: 'none' }}>
                      Go to My Gigs
                    </Link>
                    <Link to="/dashboard/volunteer" className="gig-action" style={{ background: 'none', border: '1.5px solid #E4E1F5', color: 'var(--body)', textDecoration: 'none' }}>
                      Back to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default GigCheckIn;
