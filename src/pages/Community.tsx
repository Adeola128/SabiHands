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
  volunteer_profiles: { full_name: string, avatar_url: string }[];
  organizations: { name: string, logo_url: string }[];
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
  
  // New States for Real Data & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({ posts: 0, followers: 0, gigsCompleted: 0 });
  const [userProfile, setUserProfile] = useState<any>(null); // Real DB profile

  const [openComments, setOpenComments] = useState<{ [postId: string]: boolean }>({});
  // State to hold the draft comment text for each post
  const [commentTexts, setCommentTexts] = useState<{ [postId: string]: string }>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Composer functionality
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState<{ [postId: string]: boolean }>({});

  // Saved items functionality
  const [savedPosts, setSavedPosts] = useState<string[]>(() => {
    const saved = localStorage.getItem('community_saved_posts');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const handleSavePost = (postId: string) => {
    setSavedPosts(prev => {
      const updated = prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId];
      localStorage.setItem('community_saved_posts', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    fetchSession();
    fetchPosts();
    fetchSuggestions();
  }, []);

  // Handle scrolling to specific post from URL hash after posts load
  useEffect(() => {
    if (!loading && posts.length > 0 && window.location.hash) {
      // Small timeout to ensure DOM is fully painted
      setTimeout(() => {
        const id = window.location.hash.substring(1); // remove '#'
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Optional: Add a temporary highlight class
          element.style.transition = 'box-shadow 0.5s ease-in-out';
          element.style.boxShadow = '0 0 0 4px var(--primary-color, #4F46E5)';
          setTimeout(() => {
            element.style.boxShadow = 'none';
          }, 2000);
        }
      }, 100);
    }
  }, [loading, posts]);

  const fetchSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user || null;
    setCurrentUser(user);

    if (user) {
      // Fetch exact profile from db depending on role
      const role = user.user_metadata?.role;
      if (role === 'organization') {
        const { data: orgData } = await supabase.from('organizations').select('id, name, logo_url, cover_url').eq('user_id', user.id).single();
        if (orgData) setUserProfile({ ...orgData, full_name: orgData.name, avatar_url: orgData.logo_url, role: 'organization' });
      } else {
        const { data: volData } = await supabase.from('volunteer_profiles').select('id, full_name, avatar_url, cover_url').eq('user_id', user.id).single();
        if (volData) setUserProfile({ ...volData, role: 'volunteer' });
      }

      // Fetch User Stats
      const [postsRes, followersRes] = await Promise.all([
        supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('organization_followers').select('*', { count: 'exact', head: true }).eq('organization_id', user.user_metadata?.org_id || user.id) // simplistic check
      ]);
      
      setUserStats({
        posts: postsRes.count || 0,
        followers: followersRes.count || 0,
        gigsCompleted: 0 // Mock for now until gig attendance is fully implemented
      });
    }
  };

  const fetchSuggestions = async () => {
    // Fetch 2 random organizations
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id, name, bio, logo_url, slug')
      .limit(2);
      
    // Fetch 2 random volunteers
    const { data: vols } = await supabase
      .from('volunteer_profiles')
      .select('user_id, full_name, headline, avatar_url')
      .limit(2);

    let combined: any[] = [];
    if (orgs) combined = [...combined, ...orgs.map(o => ({ ...o, isOrg: true, display_name: o.name, display_avatar: o.logo_url }))];
    if (vols) combined = [...combined, ...vols.map(v => ({ ...v, id: v.user_id, bio: v.headline, isOrg: false, display_name: v.full_name, display_avatar: v.avatar_url }))];
    
    // Shuffle and pick 3
    combined = combined.sort(() => 0.5 - Math.random()).slice(0, 3);
    setSuggestions(combined);
  };

  const truncateBio = (bio: string, length = 60) => {
    if (!bio) return '';
    if (bio.length <= length) return bio;
    return bio.slice(0, length) + '...';
  };

  const handleFollow = async (orgId: string) => {
    if (!currentUser) return alert('Please sign in to follow organizations.');
    
    // Optimistic UI could be implemented, but simple insert for now
    const { error } = await supabase.from('organization_followers').insert({
      organization_id: orgId
    });
    
    if (error) {
      console.error('Error following:', error);
      alert('Failed to follow organization.');
    } else {
      alert('Successfully followed!');
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Step 1: Fetch posts with likes and comments, but without the author relation
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          id, content, image_url, created_at, author_id,
          likes:community_likes(user_id),
          comments:community_comments(
            id, content, created_at, author_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else if (data) {
        // Step 2: Extract all unique author IDs from posts and comments
        const authorIds = new Set<string>();
        data.forEach(p => {
          authorIds.add(p.author_id);
          p.comments?.forEach((c: any) => authorIds.add(c.author_id));
        });
        const uniqueAuthorIds = Array.from(authorIds);

        // Step 3: Fetch profiles and orgs for those authors
        const [volsRes, orgsRes] = await Promise.all([
          supabase.from('volunteer_profiles').select('user_id, full_name, avatar_url').in('user_id', uniqueAuthorIds),
          supabase.from('organizations').select('user_id, name, logo_url').in('user_id', uniqueAuthorIds)
        ]);

        const profilesMap = new Map<string, any>();
        volsRes.data?.forEach(v => profilesMap.set(v.user_id, { id: v.user_id, role: 'volunteer', volunteer_profiles: [{ full_name: v.full_name, avatar_url: v.avatar_url }] }));
        orgsRes.data?.forEach(o => profilesMap.set(o.user_id, { id: o.user_id, role: 'organization', organizations: [{ name: o.name, logo_url: o.logo_url }] }));

        // Step 4: Map the data back into the expected structure
        const typedData = data.map(p => ({
          ...p,
          author: profilesMap.get(p.author_id) || {},
          comments: p.comments
            .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((c: any) => ({
              ...c,
              author: profilesMap.get(c.author_id) || {}
            }))
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
    if ((!postText.trim() && !selectedImage) || !currentUser || isSubmitting) return;
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `community-posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('public-images')
          .upload(filePath, selectedImage);
        
        if (uploadError) {
          console.error("Upload error", uploadError);
          alert('Failed to upload image.');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('public-images')
            .getPublicUrl(filePath);
          imageUrl = publicUrl;
        }
      }

      const { error } = await supabase.from('community_posts').insert({
        author_id: currentUser.id,
        content: postText.trim(),
        image_url: imageUrl
      });
      if (error) throw error;
      
      setPostText('');
      setSelectedImage(null);
      fetchPosts(); // Reload posts
    } catch (err) {
      console.error('Error creating post', err);
      alert('Failed to post. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const text = commentTexts[postId];
    if (!text?.trim() || !currentUser || isSubmittingComment[postId]) return;
    setIsSubmittingComment(prev => ({ ...prev, [postId]: true }));
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
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [postId]: false }));
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

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const { error } = await supabase.from('community_posts').delete().eq('id', postId);
      if (error) throw error;
      setPosts(posts.filter(p => p.id !== postId));
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post.');
    }
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
    if (author?.role === 'organization' && author.organizations?.length > 0) {
      return author.organizations[0].logo_url || '/images/automated_certificates.png';
    }
    if (author?.volunteer_profiles?.length > 0) {
      return author.volunteer_profiles[0].avatar_url || '/images/diverse_gigs.png';
    }
    return '/images/diverse_gigs.png';
  };

  return (
    <>
      {/* Left Sidebar */}
      {/* Left Sidebar */}
      <aside className="context-col hidden-on-mobile">
        <div className="community-sidebar-card">
          <div className="community-sidebar-header">
            <div 
              className="community-sidebar-cover" 
              style={{ 
                background: userProfile?.cover_url ? `url(${userProfile.cover_url}) center/cover no-repeat` : 'var(--gray-100)',
                borderBottom: userProfile?.cover_url ? 'none' : '1px solid #f3f4f6'
              }}
            ></div>
            <img 
              src={userProfile?.avatar_url || '/images/hero_illustration.png'} 
              alt="Profile" 
              className="community-sidebar-avatar" 
            />
          </div>
          <div className="community-sidebar-info">
            <Link to={userProfile?.role === 'organization' ? '/dashboard/organization/profile' : '/dashboard/volunteer/profile'} className="community-sidebar-name">
              {userProfile?.full_name || 'My Profile'}
            </Link>
            <div className="community-sidebar-bio">
              {userProfile?.role === 'organization' ? 'Organization' : 'Volunteer'}
            </div>
          </div>
          <div className="community-sidebar-stats">
            <Link to="#" className="community-sidebar-stat-row">
              <span>{userProfile?.role === 'organization' ? 'Followers' : 'Gigs completed'}</span>
              <span>{userProfile?.role === 'organization' ? userStats.followers : userStats.gigsCompleted}</span>
            </Link>
            <Link to="#" className="community-sidebar-stat-row">
              <span>Posts published</span>
              <span>{userStats.posts}</span>
            </Link>
          </div>
          <div 
            className={`community-sidebar-footer ${showSavedOnly ? 'active' : ''}`}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            style={{ 
              background: showSavedOnly ? 'var(--purple-50)' : 'transparent',
              color: showSavedOnly ? 'var(--purple-600)' : 'inherit'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={showSavedOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
            My items ({savedPosts.length})
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
        
        {/* Search Bar */}
        <motion.div variants={fadeUpVariant} className="community-search-container">
          <div className="community-search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="community-search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search posts, topics, or authors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="community-search-input"
            />
          </div>
        </motion.div>

        {/* Create Post Composer */}
        <motion.div variants={fadeUpVariant} className="composer-card community-glass-panel">
          <div className="dash-card-padding" style={{ padding: '12px 16px' }}>
            <div className="composer-input-area">
              <img src={userProfile?.avatar_url || "/images/hero_illustration.png"} alt="Current User" className="composer-avatar" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
              <div className="composer-input-wrapper">
                <textarea 
                  className={`composer-textarea ${postText || selectedImage ? 'expanded' : ''}`} 
                  placeholder={currentUser ? "Start a post" : "Please sign in to post..."}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  disabled={!currentUser}
                ></textarea>
                {selectedImage && (
                  <div style={{ marginTop: '8px', position: 'relative', display: 'inline-block' }}>
                    <img src={URL.createObjectURL(selectedImage)} alt="Selected" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="composer-actions">
              <div className="composer-tools">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  hidden 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setSelectedImage(e.target.files[0]);
                  }} 
                />
                <button className="composer-tool-btn image" disabled={!currentUser} onClick={() => fileInputRef.current?.click()}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span>Media</span>
                </button>
                <button className="composer-tool-btn event" disabled={!currentUser} onClick={() => setIsEventModalOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>Event</span>
                </button>
                <button className="composer-tool-btn article" disabled={!currentUser} onClick={() => setIsArticleModalOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span>Write article</span>
                </button>
              </div>
              {(postText.trim() || selectedImage) && (
                <button 
                  className="composer-submit" 
                  disabled={(!postText.trim() && !selectedImage) || !currentUser || isSubmitting}
                  onClick={handlePostSubmit}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              )}
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
          posts
            .filter(p => showSavedOnly ? savedPosts.includes(p.id) : true)
            .filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()) || getAuthorName(p.author).toLowerCase().includes(searchQuery.toLowerCase()))
            .map(post => {
            const isLikedByMe = currentUser && post.likes?.some(l => l.user_id === currentUser.id);
            const isSaved = savedPosts.includes(post.id);
            const authorName = getAuthorName(post.author);
            const authorAvatar = getAuthorAvatar(post.author);
            const isOrg = post.author?.role === 'organization';
            const isCommentsOpen = openComments[post.id];

            return (
              <motion.div variants={fadeUpVariant} key={post.id} id={`post-${post.id}`} className="community-post">
                <div className="post-header">
                  <div className="post-author-info">
                    <img src={authorAvatar} alt="Author" className="post-author-avatar" />
                    <div className="post-author-details">
                      {isOrg ? (
                        <Link to={`/organization/${post.author.id}`} className="post-author-name">
                          {authorName}
                        </Link>
                      ) : (
                        <span className="post-author-name">
                          {authorName}
                        </span>
                      )}
                      <span className="post-author-role">
                        {isOrg ? 'Organization' : 'Volunteer'}
                      </span>
                      <span className="post-time">
                        {formatTimeAgo(post.created_at)} • <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                      </span>
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button className="post-more-btn" onClick={() => setActiveDropdown(activeDropdown === post.id ? null : post.id)}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                    {activeDropdown === post.id && (
                      <div className="post-dropdown-menu" style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--white)', border: '1px solid #e0dfdc', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '120px' }}>
                        {currentUser?.id === post.author_id && (
                          <button onClick={() => handleDeletePost(post.id)} style={{ width: '100%', padding: '8px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'red', fontSize: '14px' }}>Delete post</button>
                        )}
                        <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`); setActiveDropdown(null); alert('Link copied!'); }} style={{ width: '100%', padding: '8px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px' }}>Copy Link</button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="post-content">
                  {post.content}
                </div>

                {post.image_url && (
                  <img src={post.image_url} alt="Post attachment" className="post-image" />
                )}
                
                <div className="post-stats">
                  <span>{post.likes?.length || 0} Likes</span>
                  <span>{post.comments?.length || 0} Comments</span>
                </div>
                
                <div className="post-actions">
                  <button 
                    className={`post-action-btn ${isLikedByMe ? 'active' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={isLikedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                    Like
                  </button>
                  <button 
                    className="post-action-btn"
                    onClick={() => toggleComments(post.id)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    Comment
                  </button>
                  <button 
                    className={`post-action-btn ${isSaved ? 'active' : ''}`}
                    onClick={() => handleSavePost(post.id)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
                    Save
                  </button>
                  <button 
                    className="post-action-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                      alert('Link copied to clipboard!');
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3l4 4-4 4"></path><path d="M3 17l4 4 4-4"></path><path d="M21 7H7a4 4 0 0 0-4 4v0"></path><path d="M3 17h14a4 4 0 0 0 4-4v0"></path></svg>
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
                              disabled={!commentTexts[post.id]?.trim() || !currentUser || isSubmittingComment[post.id]}
                              onClick={() => handleCommentSubmit(post.id)}
                            >
                              {isSubmittingComment[post.id] ? (
                                <span style={{ fontSize: '12px', padding: '0 4px' }}>...</span>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </motion.div>
            );
          })
        )}

      </motion.div>

      {/* Right Sidebar */}
      <aside className="context-col hidden-on-mobile">
        <div className="community-sidebar-card">
          <div className="community-news-header">
            <h3>Add to your feed</h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </div>
          {suggestions.map((item, index) => (
            <div key={index} className="community-suggestion-item">
              <img src={item.display_avatar || "/images/hero_illustration.png"} alt={item.display_name} style={{ objectFit: 'cover' }} />
              <div className="community-suggestion-info">
                <Link to={item.isOrg ? `/organization/${item.id}` : `/volunteer/${item.id}`} className="community-suggestion-name" style={{ textDecoration: 'none', color: 'inherit' }}>{item.display_name}</Link>
                <div className="community-suggestion-bio">{truncateBio(item.bio)}</div>
                <button className="community-suggestion-btn" onClick={() => handleFollow(item.id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                  {item.isOrg ? 'Follow' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
          {suggestions.length === 0 && (
            <div style={{ padding: '0 16px 12px', fontSize: '12px', color: 'var(--gray-500)' }}>No suggestions available.</div>
          )}
          <Link to="/dashboard/community/recommendations" className="community-sidebar-footer" style={{ justifyContent: 'center', textDecoration: 'none' }}>
            View all recommendations <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </Link>
        </div>
      </aside>

      {/* Event Modal */}
      <AnimatePresence>
        {isEventModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
            onClick={() => setIsEventModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>Create an Event</h2>
              <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>Event creation functionality is coming soon. Stay tuned!</p>
              <button className="composer-submit" onClick={() => setIsEventModalOpen(false)} style={{ width: '100%' }}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Article Modal */}
      <AnimatePresence>
        {isArticleModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
            onClick={() => setIsArticleModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>Write an Article</h2>
              <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>Long-form article publishing functionality is coming soon.</p>
              <button className="composer-submit" onClick={() => setIsArticleModalOpen(false)} style={{ width: '100%' }}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Community;
