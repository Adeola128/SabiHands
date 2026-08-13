import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  gigId: string;
  reviewerId: string;
  revieweeId: string;
  orgName: string;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, gigId, reviewerId, revieweeId, orgName, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('reviews').insert([{
        gig_id: gigId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment
      }]);
      
      if (error) throw error;
      
      toast.success('Review submitted successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)' }} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '440px', backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>Rate Your Experience</h2>
          <p style={{ fontSize: '14px', color: 'var(--body)', marginBottom: '24px' }}>How was volunteering with {orgName}?</p>
          
          <div style={{ display: 'flex', gap: '8px', cursor: 'pointer', marginBottom: '24px', justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <svg 
                key={star} 
                onClick={() => setRating(star)}
                width="32" height="32" viewBox="0 0 24 24" 
                fill={star <= rating ? "#FFC107" : "none"} 
                stroke={star <= rating ? "#FFC107" : "var(--muted)"} 
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: 'all 0.2s' }}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            ))}
          </div>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>Write a review (optional)</label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about your experience..."
            style={{ width: '100%', padding: '12px', border: '1.5px solid #E4E1F5', borderRadius: '10px', minHeight: '100px', resize: 'vertical', fontSize: '14px', fontFamily: 'var(--sans)', outline: 'none', marginBottom: '24px' }}
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--paper)', color: 'var(--ink)', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSubmit} disabled={isSubmitting || rating === 0} style={{ flex: 2, padding: '12px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', opacity: (isSubmitting || rating === 0) ? 0.7 : 1 }}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewModal;
