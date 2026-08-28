import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import '../Community.css';
import './PublicOrganizationProfile.css'; // For layout container styles

interface Author {
  id: string;
  role: 'volunteer' | 'organization' | 'admin';
  volunteer_profiles: { full_name: string, avatar_url: string, cover_url?: string, headline?: string }[];
  organizations: { name: string, logo_url: string, cover_url?: string, bio?: string }[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: Author;
}

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author_id: string;
  author: Author;
  likes: { user_id: string }[];
  comments: Comment[];
}

const fadeUpVariant: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const PublicPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Step 1: Fetch post with likes and comments
        const { data, error } = await supabase
          .from('community_posts')
          .select(`
            id, content, image_url, created_at, author_id,
            likes:community_likes(user_id),
            comments:community_comments(
              id, content, created_at, author_id
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Post not found");

        // Step 2: Extract all unique author IDs
        const authorIds = new Set<string>();
        authorIds.add(data.author_id);
        data.comments?.forEach((c: any) => authorIds.add(c.author_id));
        const uniqueAuthorIds = Array.from(authorIds);

        // Step 3: Fetch profiles and orgs for those authors
        const [volsRes, orgsRes] = await Promise.all([
          supabase.from('volunteer_profiles').select('user_id, full_name, avatar_url, cover_url, headline').in('user_id', uniqueAuthorIds),
          supabase.from('organizations').select('user_id, name, logo_url, cover_url, bio').in('user_id', uniqueAuthorIds)
        ]);

        const profilesMap = new Map<string, any>();
        volsRes.data?.forEach(v => profilesMap.set(v.user_id, { id: v.user_id, role: 'volunteer', volunteer_profiles: [{ full_name: v.full_name, avatar_url: v.avatar_url, cover_url: v.cover_url, headline: v.headline }] }));
        orgsRes.data?.forEach(o => profilesMap.set(o.user_id, { id: o.user_id, role: 'organization', organizations: [{ name: o.name, logo_url: o.logo_url, cover_url: o.cover_url, bio: o.bio }] }));

        // Step 4: Map the data back into the expected structure
        const typedPost = {
          ...data,
          author: profilesMap.get(data.author_id) || {},
          comments: data.comments
            .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((c: any) => ({
              ...c,
              author: profilesMap.get(c.author_id) || {}
            }))
        };
        
        setPost(typedPost as unknown as Post);
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getAuthorName = (author: Author) => {
    if (author?.role === 'organization' && author.organizations?.length > 0) {
      return author.organizations[0].name;
    }
    if (author?.volunteer_profiles?.length > 0) {
      return author.volunteer_profiles[0].full_name;
    }
    return 'Unknown User';
  };

  const getAuthorAvatar = (author: Author) => {
    if (author?.role === 'organization' && author.organizations?.length > 0) {
      return author.organizations[0].logo_url || '/images/automated_certificates.png';
    }
    if (author?.volunteer_profiles?.length > 0) {
      return author.volunteer_profiles[0].avatar_url || '/images/diverse_gigs.png';
    }
    return '/images/diverse_gigs.png';
  };

  const handleLike = () => {
    if (!currentUser) return alert("Please log in to like this post.");
    // Prompt to use the main community feed for now, or implement standalone likes
    alert("Please visit the main Community Feed to engage with posts!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) return <LoadingScreen message="Loading post..." fullScreen={true} />;

  if (!post) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--gray-50)' }}>
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--white)', borderRadius: '16px', border: '1px solid #e0dfdc' }}>
          <h2 style={{ marginBottom: '16px', color: 'var(--ink)' }}>Post Not Found</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>This post may have been removed or does not exist.</p>
          <Link to="/community" style={{ padding: '12px 24px', backgroundColor: 'var(--primary-color, #4F46E5)', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>Go to Community</Link>
        </div>
      </div>
    );
  }

  const authorName = getAuthorName(post.author);
  const authorAvatar = getAuthorAvatar(post.author);
  const isOrg = post.author?.role === 'organization';
  const isLikedByMe = currentUser && post.likes?.some(l => l.user_id === currentUser.id);

  const authorBio = isOrg 
    ? (post.author?.organizations?.[0]?.bio || 'Organization making an impact.')
    : (post.author?.volunteer_profiles?.[0]?.headline || 'Volunteer making a difference.');
    
  const authorCover = isOrg 
    ? (post.author?.organizations?.[0]?.cover_url)
    : (post.author?.volunteer_profiles?.[0]?.cover_url);
    
  const profileLink = isOrg ? `/organization/${post.author.id}` : `/volunteer/${post.author.id}`;

  return (
    <div style={{ backgroundColor: '#F3F2EF', minHeight: '100vh' }}>
      <Helmet>
        <title>{authorName}'s Post | Ralvo</title>
        <meta name="description" content={post.content.slice(0, 150)} />
      </Helmet>

      <div className="public-profile-container">
        <div className="public-layout-grid">
          
          {/* Main Content */}
          <div className="public-profile-main">
            <motion.div initial="hidden" animate="visible" variants={fadeUpVariant} className="community-post" style={{ margin: 0 }}>
              <div className="post-header">
                <div className="post-author-info">
                  <img src={authorAvatar} alt="Author" className="post-author-avatar" />
                  <div className="post-author-details">
                    <Link to={profileLink} className="post-author-name" style={{ textDecoration: 'none' }}>
                      {authorName}
                    </Link>
                    <span className="post-author-role">
                      {isOrg ? 'Organization' : 'Volunteer'}
                    </span>
                    <span className="post-time">
                      {formatTimeAgo(post.created_at)} • <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    </span>
                  </div>
                </div>
                <button className="post-more-btn" onClick={handleCopyLink} title="Copy Link">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </button>
              </div>
              
              <div className="post-content" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                {post.content}
              </div>

              {post.image_url && (
                <img src={post.image_url} alt="Post attachment" className="post-image" />
              )}
              
              <div className="post-stats">
                <span>{post.likes?.length || 0} Likes</span>
                <span>{post.comments?.length || 0} Comments</span>
              </div>
              
              <div className="post-actions" style={{ justifyContent: 'flex-start', gap: '24px' }}>
                <button 
                  className={`post-action-btn ${isLikedByMe ? 'active' : ''}`}
                  onClick={handleLike}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={isLikedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  Like
                </button>
                <button 
                  className="post-action-btn"
                  onClick={handleCopyLink}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3l4 4-4 4"></path><path d="M3 17l4 4 4-4"></path><path d="M21 7H7a4 4 0 0 0-4 4v0"></path><path d="M3 17h14a4 4 0 0 0 4-4v0"></path></svg>
                  Share
                </button>
              </div>

              {/* Comments Section (Read-only) */}
              {post.comments && post.comments.length > 0 && (
                <div className="post-comments-section" style={{ height: 'auto', opacity: 1, marginTop: '16px' }}>
                  <div className="comments-list">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <img src={getAuthorAvatar(comment.author)} alt="Comment Author" className="comment-avatar" />
                        <div className="comment-body">
                          <div className="comment-header">
                            <span className="comment-author-name">{getAuthorName(comment.author)}</span>
                            <span className="comment-time">{formatTimeAgo(comment.created_at)}</span>
                          </div>
                          <div className="comment-text">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!currentUser && (
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--gray-50)', borderRadius: '8px', marginTop: '16px' }}>
                  <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: '14px' }}>
                    <Link to="/login" style={{ color: 'var(--primary-color, #4F46E5)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link> to join the conversation.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar (About the Author) */}
          <div className="public-profile-sidebar hidden-on-mobile">
            <div className="public-hero-card" style={{ overflow: 'hidden', paddingBottom: '16px', textAlign: 'center' }}>
              <div 
                className="public-cover-area" 
                style={{ 
                  height: '80px', 
                  backgroundImage: authorCover ? `url(${authorCover})` : 'none',
                  backgroundColor: authorCover ? 'transparent' : 'var(--purple-100)'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-40px' }}>
                <img 
                  src={authorAvatar} 
                  alt={authorName} 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    border: '4px solid white', 
                    backgroundColor: 'white',
                    objectFit: 'cover'
                  }} 
                />
              </div>
              <div style={{ padding: '0 16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '8px', marginBottom: '4px' }}>{authorName}</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px', lineHeight: 1.4 }}>
                  {authorBio}
                </p>
                <Link to={profileLink} className="btn-li-secondary" style={{ width: '100%' }}>
                  View Full Profile
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default PublicPostDetail;
