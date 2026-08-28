-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create community_likes table
CREATE TABLE IF NOT EXISTS public.community_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create community_comments table
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Policies for community_posts
CREATE POLICY "Anyone can view community posts"
    ON public.community_posts FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create community posts"
    ON public.community_posts FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update their own posts"
    ON public.community_posts FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own posts"
    ON public.community_posts FOR DELETE
    USING (auth.uid() = author_id);

-- Policies for community_likes
CREATE POLICY "Anyone can view community likes"
    ON public.community_likes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can like posts"
    ON public.community_likes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can unlike their own likes"
    ON public.community_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for community_comments
CREATE POLICY "Anyone can view community comments"
    ON public.community_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can comment"
    ON public.community_comments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update their own comments"
    ON public.community_comments FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments"
    ON public.community_comments FOR DELETE
    USING (auth.uid() = author_id);
