import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { user_id, action } = await req.json();

    if (!user_id || !action) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (action === 'gig_completion') {
      const basePoints = 500;
      // Variable reward mechanics: 70% chance of 50 bonus, 20% chance of 200 bonus, 10% chance of 1000 bonus
      const random = Math.random();
      let bonusPoints = 50;
      if (random > 0.9) {
        bonusPoints = 1000;
      } else if (random > 0.7) {
        bonusPoints = 200;
      }

      // 1. Insert Base Points
      await supabaseClient.from('point_transactions').insert({
        user_id,
        amount: basePoints,
        transaction_type: 'gig_completion',
        description: 'Earned points for completing a gig'
      });

      // 2. Insert Bonus Points
      await supabaseClient.from('point_transactions').insert({
        user_id,
        amount: bonusPoints,
        transaction_type: 'variable_bonus',
        description: 'Mystery variable bonus for gig completion!'
      });

      return new Response(JSON.stringify({ 
        success: true, 
        basePoints, 
        bonusPoints,
        totalPoints: basePoints + bonusPoints
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
