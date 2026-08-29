-- Advanced Rewards & Budgeting Migration

-- Table to track the global monthly budget for rewards (10,000 NGN)
CREATE TABLE IF NOT EXISTS public.global_reward_budgets (
    month_year VARCHAR(7) PRIMARY KEY, -- Format: 'YYYY-MM'
    total_spent_ngn DECIMAL(10, 2) DEFAULT 0.00,
    budget_cap_ngn DECIMAL(10, 2) DEFAULT 10000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS is enabled but restrict access to service role only for updates
ALTER TABLE public.global_reward_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to budget" 
    ON public.global_reward_budgets FOR SELECT 
    USING (true);

-- Only edge functions / service role can insert or update
-- (Handled implicitly since service role bypasses RLS)

-- If we previously created the 700 NGN payout trigger, let's safely remove it
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'check_payout_limit') THEN
    DROP TRIGGER IF EXISTS check_payout_limit ON public.redemption_requests;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'enforce_max_payout_limit') THEN
    DROP FUNCTION IF EXISTS enforce_max_payout_limit();
  END IF;
END $$;

-- If redemption_requests exists and has a check constraint for reward_type, we might need to alter it, 
-- but assuming it's text, we can just insert new types like 'subscription' and 'points_bonus'.
