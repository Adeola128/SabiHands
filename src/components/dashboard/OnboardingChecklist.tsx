import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrgOnboardingState } from '../../hooks/useOrgOnboardingState';
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
  isComplete: boolean;
}

interface OnboardingChecklistProps {
  organization: any;
  stats: any;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ organization, stats }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Derive completed status from data
  const { hasProfile, hasContact, hasDocs, hasGigs } = useOrgOnboardingState(organization, stats);

  const items: ChecklistItem[] = [
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Add a bio and logo so volunteers know who you are.',
      link: '/dashboard/org/settings',
      linkText: 'Edit Profile',
      isComplete: hasProfile
    },
    {
      id: 'contact',
      title: 'Add Contact Info',
      description: 'Provide phone and location details.',
      link: '/dashboard/org/settings',
      linkText: 'Update Info',
      isComplete: hasContact
    },
    {
      id: 'verify',
      title: 'Get Verified',
      description: 'Upload your CAC documents to get verified.',
      link: '/dashboard/org/settings',
      linkText: 'Upload Docs',
      isComplete: hasDocs
    },
    {
      id: 'gig',
      title: 'Post your first Gig',
      description: 'Start finding passionate volunteers for your cause.',
      link: '/dashboard/org/gigs/new',
      linkText: 'Post a Gig',
      isComplete: hasGigs
    }
  ];

  const completedCount = items.filter(i => i.isComplete).length;
  const totalCount = items.length;
  const progress = (completedCount / totalCount) * 100;

  if (isDismissed || completedCount === totalCount) return null;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative' }}>
      <button 
        onClick={() => setIsDismissed(true)} 
        style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--purple-50)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div>
          <h2 style={{ fontSize: '20px', color: 'var(--ink)', margin: '0 0 4px 0', fontWeight: 700 }}>Getting Started Checklist</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>{completedCount} of {totalCount} complete</span>
            <div style={{ width: '100px', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '99px' }}>
              <div style={{ height: '100%', backgroundColor: 'var(--purple-600)', borderRadius: '99px', width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: item.isComplete ? '#F8FAFC' : 'white', border: `1px solid ${item.isComplete ? '#E2E8F0' : 'var(--purple-100)'}`, borderRadius: '12px', opacity: item.isComplete ? 0.7 : 1 }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${item.isComplete ? '#10B981' : '#CBD5E1'}`, backgroundColor: item.isComplete ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              {item.isComplete && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px 0', textDecoration: item.isComplete ? 'line-through' : 'none' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--body)', margin: '0 0 12px 0', lineHeight: 1.5 }}>{item.description}</p>
              {!item.isComplete && (
                <Link to={item.link} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--purple-600)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {item.linkText} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingChecklist;
