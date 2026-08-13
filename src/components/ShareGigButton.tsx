import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Share2, Check } from 'lucide-react';

interface ShareGigButtonProps {
  gigId: string;
  title: string;
  text?: string;
  buttonText?: string;
  variant?: 'primary' | 'secondary' | 'icon' | 'outline';
  slug?: string;
}

const ShareGigButton: React.FC<ShareGigButtonProps> = ({ 
  gigId, 
  title, 
  text = 'Check out this gig!', 
  buttonText = 'Share Gig',
  variant = 'secondary',
  slug
}) => {
  const [copied, setCopied] = useState(false);
  const identifier = slug || gigId;
  const shareUrl = `${window.location.origin}/gig/${identifier}`;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title,
      text,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy link.');
    });
  };

  if (variant === 'icon') {
    return (
      <button 
        onClick={handleShare}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: copied ? 'var(--teal-600)' : 'var(--muted)',
          padding: '8px',
          borderRadius: '50%',
          transition: 'all 0.2s ease',
        }}
        title="Share"
        onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--paper)'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {copied ? <Check size={18} /> : <Share2 size={18} />}
      </button>
    );
  }

  const getStyles = () => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '10px 16px',
      borderRadius: '8px',
      fontWeight: 600,
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      border: 'none',
      width: '100%'
    };

    if (variant === 'primary') {
      return { ...base, backgroundColor: 'var(--purple-600)', color: 'white' };
    }
    if (variant === 'outline') {
      return { ...base, backgroundColor: 'transparent', color: 'var(--purple-600)', border: '1.5px solid var(--purple-200)' };
    }
    return { ...base, backgroundColor: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--border)' };
  };

  return (
    <button 
      onClick={handleShare} 
      style={getStyles()}
      onMouseOver={e => {
        if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--purple-700)';
        else if (variant === 'outline') e.currentTarget.style.backgroundColor = 'var(--purple-50)';
        else e.currentTarget.style.backgroundColor = '#E4E1F5';
      }}
      onMouseOut={e => {
        if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--purple-600)';
        else if (variant === 'outline') e.currentTarget.style.backgroundColor = 'transparent';
        else e.currentTarget.style.backgroundColor = 'var(--paper)';
      }}
    >
      {copied ? <Check size={18} color={variant === 'primary' ? 'white' : 'var(--teal-600)'} /> : <Share2 size={18} />}
      {copied ? 'Copied!' : buttonText}
    </button>
  );
};

export default ShareGigButton;
