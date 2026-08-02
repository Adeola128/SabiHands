import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/LoadingScreen';
import './Community.css';

interface Author {
  id: string;
  role: 'volunteer' | 'organization' | 'admin';
  volunteer_profiles: { full_name: string }[];
  organizations: { name: string }[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
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

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const Community: React.FC = () => {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // State to track which post has its comment section open
  const [openComments, setOpenComments] = useState<{ [postId: string]: boolean }>({});
  // State to hold the draft comment text for each post
  const [commentTexts, setCommentTexts] = useState<{ [postId: string]: string }>({});

  useEffect(() => {
    fetchSession();
    fetchPosts();
  }, []);

  const fetchSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          id, content, image_url, created_at, author_id,
          author:users(
            id, role,
            volunteer_profiles(full_name),
            organizations(name)
          ),
          likes:community_likes(user_id),
          comments:community_comments(
            id, content, created_at,
            author:users(
              id, role,
              volunteer_profiles(full_name),
              organizations(name)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        // Safe cast and map comments correctly
        const typedData = (data as any[]).map(p => ({
          ...p,
          comments: p.comments.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        }));
        setPosts(typedData as unknown as Post[]);
      }
    } catch (err) {
      console.error('Unexpected error fetching posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!postText.trim() || !currentUser) return;
    try {
      const { error } = await supabase.from('community_posts').insert({
        author_id: currentUser.id,
        content: postText.trim()
      });
      if (error) throw error;
      
      setPostText('');
      fetchPosts(); // Reload posts
    } catch (err) {
      console.error('Error creating post', err);
      alert('Failed to post. Please try again later.');
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const text = commentTexts[postId];
    if (!text?.trim() || !currentUser) return;
    try {
      const { error } = await supabase.from('community_comments').insert({
        post_id: postId,
        author_id: currentUser.id,
        content: text.trim()
      });
      if (error) throw error;
      
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      fetchPosts(); // Reload to get new comment
    } catch (err) {
      console.error('Error creating comment', err);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return alert("Please log in to like a post.");

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const hasLiked = post.likes.some(l => l.user_id === currentUser.id);

    try {
      if (hasLiked) {
        await supabase
          .from('community_likes')
          .delete()
          .match({ post_id: postId, user_id: currentUser.id });
      } else {
        await supabase
          .from('community_likes')
          .insert({ post_id: postId, user_id: currentUser.id });
      }
      // Re-fetch to get updated like counts
      fetchPosts();
    } catch (err) {
      console.error('Error toggling like', err);
    }
  };

  const toggleComments = (postId: string) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

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
    if (author?.role === 'organization') return '/images/automated_certificates.png';
    return '/images/diverse_gigs.png';
  };

  return (
    <>
      {/* Left Sidebar */}
      <aside className="context-col">
        <nav className="community-sidebar-nav">
          <a href="#" className="community-nav-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home Feed
          </a>
          <a href="#" className="community-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            My Posts
          </a>
          <a href="#" className="community-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
            Saved Discussions
          </a>
        </nav>

        <div className="dash-card community-glass-panel">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '16px', marginBottom: '24px' }}>Trending Topics</h2>
            
            <div className="trending-topic">
              <span className="hash">#TechForGood</span>
              <span className="posts">1.2k posts</span>
            </div>
            <div className="trending-topic">
              <span className="hash">#BeachCleanupLagos</span>
              <span className="posts">840 posts</span>
            </div>
            <div className="trending-topic">
              <span className="hash">#VolunteerStories</span>
              <span className="posts">532 posts</span>
            </div>
            <div className="trending-topic">
              <span className="hash">#NGOFundraising</span>
              <span className="posts">215 posts</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Feed */}
      <motion.div 
        className="main-content"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        
        {/* Create Post Composer */}
        <motion.div variants={fadeUpVariant} className="dash-card composer-card community-glass-panel">
          <div className="dash-card-padding">
            <div className="composer-input-area">
              <img src="/images/hero_illustration.png" alt="Current User" className="composer-avatar" />
              <div className="composer-input-wrapper">
                <textarea 
                  className="composer-textarea" 
                  placeholder={currentUser ? "Share an update, ask a question, or post a story..." : "Please sign in to post..."}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  disabled={!currentUser}
                ></textarea>
              </div>
            </div>
            <div className="composer-actions">
              <div className="composer-tools">
                <button className="composer-tool-btn image" disabled={!currentUser}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span>Photo</span>
                </button>
                <button className="composer-tool-btn video" disabled={!currentUser}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  <span>Video</span>
                </button>
              </div>
              <button 
                className="composer-submit" 
                disabled={!postText.trim() || !currentUser}
                onClick={handlePostSubmit}
              >
                Post
              </button>
            </div>
          </div>
        </motion.div>

        {/* Post Feed */}
        {loading ? (
          <motion.div variants={fadeUpVariant} style={{ width: '100%' }}>
            <LoadingScreen message="Loading feed..." fullScreen={false} />
          </motion.div>
        ) : posts.length === 0 ? (
          <motion.div variants={fadeUpVariant} style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
            No posts yet. Be the first to start a discussion!
          </motion.div>
        ) : (
          posts.map(post => {
            const isLikedByMe = currentUser && post.likes?.some(l => l.user_id === currentUser.id);
            const authorName = getAuthorName(post.author);
            const authorAvatar = getAuthorAvatar(post.author);
            const isOrg = post.author?.role === 'organization';
            const isCommentsOpen = openComments[post.id];

            return (
              <motion.div variants={fadeUpVariant} key={post.id} className="dash-card community-post community-glass-panel">
                <div className="dash-card-padding">
                  <div className="post-header">
                    <div className="post-author-info">
                      <img src={authorAvatar} alt="Author" className="post-author-avatar" />
                      <div className="post-author-details">
                        {isOrg ? (
                          <Link to="/dashboard/organization/profile" className="post-author-name" style={{ textDecoration: 'none', color: 'inherit' }}>
                            {authorName}
                            <span className="post-author-role org">Organization</span>
                          </Link>
                        ) : (
                          <span className="post-author-name">
                            {authorName}
                            <span className="post-author-role">Volunteer</span>
                          </span>
                        )}
                        <span className="post-time">{formatTimeAgo(post.created_at)}</span>
                      </div>
                    </div>
                    <button className="post-more-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                  </div>
                  
                  <div className="post-content">
                    {post.content}
                  </div>

                  {post.image_url && (
                    <img src={post.image_url} alt="Post attachment" className="post-image" />
                  )}
                  
                  <div className="post-stats">
                    <span>{post.likes?.length || 0} Likes</span>
                    <span>
                      {post.comments?.length || 0} Comments
                    </span>
                  </div>
                  
                  <div className="post-actions">
                    <button 
                      className="post-action-btn" 
                      style={{ color: isLikedByMe ? 'var(--purple-600)' : 'inherit' }}
                      onClick={() => handleLike(post.id)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isLikedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                      {isLikedByMe ? 'Liked' : 'Like'}
                    </button>
                    <button 
                      className="post-action-btn"
                      onClick={() => toggleComments(post.id)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      Comment
                    </button>
                    <button className="post-action-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
                      Share
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {isCommentsOpen && (
                      <motion.div 
                        className="post-comments-section"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="comments-list">
                          {post.comments?.map(comment => (
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

                        {/* Comment Composer */}
                        <div className="comment-composer">
                          <img src="/images/hero_illustration.png" alt="You" className="comment-composer-avatar" />
                          <div className="comment-input-wrapper">
                            <input 
                              type="text" 
                              className="comment-input" 
                              placeholder="Write a comment..." 
                              value={commentTexts[post.id] || ''}
                              onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                              disabled={!currentUser}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommentSubmit(post.id);
                              }}
                            />
                            <button 
                              className="comment-submit-btn"
                              disabled={!commentTexts[post.id]?.trim() || !currentUser}
                              onClick={() => handleCommentSubmit(post.id)}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        )}

      </motion.div>
    </>
  );
};

export default Community;
