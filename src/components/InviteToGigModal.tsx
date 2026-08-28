import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface InviteToGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteerId: string;
  volunteerName: string;
}

const InviteToGigModal: React.FC<InviteToGigModalProps> = ({ isOpen, onClose, volunteerId, volunteerName }) => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedGigId, setSelectedGigId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen || !user) return;
    
    const fetchOrgGigs = async () => {
      setLoading(true);
      try {
        // First get the org id for this user
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (orgError || !orgData) {
          console.error('Error fetching org profile:', orgError);
          setLoading(false);
          return;
        }

        // Fetch active gigs for this org
        const { data: gigsData, error: gigsError } = await supabase
          .from('gigs')
          .select('id, title')
          .eq('organization_id', orgData.id)
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (!gigsError && gigsData) {
          setGigs(gigsData);
          if (gigsData.length > 0) {
            setSelectedGigId(gigsData[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch gigs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgGigs();
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGigId) {
      toast.error('Please select a gig first.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Get org_id again
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user?.id)
        .single();
        
      if (!orgData) throw new Error('Organization not found');

      const { error } = await supabase
        .from('invitations')
        .insert({
          gig_id: selectedGigId,
          volunteer_id: volunteerId,
          org_id: orgData.id,
          message: message,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already invited this volunteer to this gig.');
        } else {
          throw error;
        }
      } else {
        toast.success(`Successfully invited ${volunteerName}!`);
        onClose();
        setMessage('');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px', margin: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #EBEBEB', paddingBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--ink)' }}>Invite {volunteerName}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)' }}>Loading your gigs...</div>
        ) : gigs.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink)', fontWeight: 500, marginBottom: '8px' }}>No active gigs found.</p>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>You need to create and open a gig before you can invite volunteers.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Select Gig</label>
              <select 
                value={selectedGigId} 
                onChange={(e) => setSelectedGigId(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1CEDF', fontSize: '15px' }}
                required
              >
                {gigs.map(gig => (
                  <option key={gig.id} value={gig.id}>{gig.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Personal Message (Optional)</label>
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, I saw your profile and thought you'd be a great fit for our upcoming opportunity..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1CEDF', fontSize: '15px', minHeight: '100px', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                onClick={onClose}
                style={{ padding: '10px 20px', borderRadius: '100px', border: '1px solid #D1CEDF', background: 'transparent', fontWeight: 600, cursor: 'pointer', color: 'var(--ink)' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', background: 'var(--blue-600)', color: 'white', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteToGigModal;
