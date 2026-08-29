// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types of rewards and their Naira budget costs
const REWARDS = {
  POINTS: { type: 'points_bonus', name: 'Points Bonus', pointsAmount: 1500, costNgn: 0 },
  AIRTIME: { type: 'airtime', name: 'Airtime', ngnAmount: 500, costNgn: 500 },
  CASH: { type: 'cash', name: 'Cashback', ngnAmount: 2500, costNgn: 2500 },
  SUBSCRIPTION: { type: 'subscription', name: 'Spotify / YouTube Voucher', costNgn: 1500, pointsAmount: 0 }
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role to bypass RLS for budget updates
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { user_id } = await req.json();
    if (!user_id) throw new Error('user_id is required');

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 1. Check Global Budget
    let { data: budgetData, error: budgetError } = await supabaseClient
      .from('global_reward_budgets')
      .select('*')
      .eq('month_year', currentMonthStr)
      .single();

    if (budgetError && budgetError.code !== 'PGRST116') {
      throw budgetError;
    }

    let totalSpent = budgetData ? budgetData.total_spent_ngn : 0;
    const budgetCap = budgetData ? budgetData.budget_cap_ngn : 10000;

    // 2. Weighted Randomization
    const rand = Math.random() * 100;
    let selectedReward;

    // If budget is already full, strictly force POINTS (costs 0)
    if (totalSpent >= budgetCap) {
      selectedReward = REWARDS.POINTS;
    } else {
      // 50% Points, 30% Airtime, 15% Cash, 5% Subscription
      if (rand < 50) {
        selectedReward = REWARDS.POINTS;
      } else if (rand < 80) {
        selectedReward = REWARDS.AIRTIME;
      } else if (rand < 95) {
        selectedReward = REWARDS.CASH;
      } else {
        selectedReward = REWARDS.SUBSCRIPTION;
      }
    }

    // 3. Fallback Check: Does this specific reward push us over the 10k budget?
    if (totalSpent + selectedReward.costNgn > budgetCap) {
      selectedReward = REWARDS.POINTS; // Fallback to free points
    }

    // 4. Record the win
    if (selectedReward.type === 'points_bonus') {
      // Give points directly
      await supabaseClient.from('point_transactions').insert({
        user_id,
        amount: (selectedReward as any).pointsAmount,
        transaction_type: 'mega_mystery_bonus',
        description: `Won Mega Mystery Box: ${(selectedReward as any).pointsAmount} Points!`
      });
    } else {
      // Queue a redemption request for Cash, Airtime, or Subscription (to be fulfilled via Paga/Manually)
      await supabaseClient.from('redemption_requests').insert({
        user_id,
        reward_type: selectedReward.type,
        naira_value: selectedReward.costNgn,
        status: 'pending',
        points_cost: 0 // Free reward for milestone
      });
    }

    // 5. Update the Global Budget if there was a NGN cost
    if (selectedReward.costNgn > 0) {
      const newTotal = totalSpent + selectedReward.costNgn;
      
      if (!budgetData) {
        // Insert new month row
        await supabaseClient.from('global_reward_budgets').insert({
          month_year: currentMonthStr,
          total_spent_ngn: newTotal,
          budget_cap_ngn: 10000
        });
      } else {
        // Update existing row
        await supabaseClient.from('global_reward_budgets').update({
          total_spent_ngn: newTotal,
          updated_at: new Date()
        }).eq('month_year', currentMonthStr);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      reward: selectedReward,
      budget_remaining: budgetCap - (totalSpent + selectedReward.costNgn)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
