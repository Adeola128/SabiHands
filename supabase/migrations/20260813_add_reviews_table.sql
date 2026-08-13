create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  gig_id uuid references public.gigs(id) on delete cascade not null,
  reviewer_id uuid references auth.users(id) on delete cascade not null,
  reviewee_id uuid references auth.users(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone."
  on public.reviews for select
  using ( true );

create policy "Users can insert reviews."
  on public.reviews for insert
  with check ( auth.uid() = reviewer_id );
