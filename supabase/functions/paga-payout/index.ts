// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Points to Naira conversion rate (e.g., 10 points = 1 NGN)
const POINTS_TO_NAIRA_RATE = 10;
// Maximum allowed payout per request (in NGN)
const MAX_PAYOUT_NGN = 700;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { user_id, reward_type, points_cost, destination_account } = await req.json();

    if (!user_id || !reward_type || !points_cost || !destination_account) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const nairaValue = points_cost / POINTS_TO_NAIRA_RATE;

    // Hardcoded constraint: Prevent payouts exceeding 700 NGN
    if (nairaValue > MAX_PAYOUT_NGN) {
      return new Response(JSON.stringify({ error: `Requested payout exceeds the maximum limit of ${MAX_PAYOUT_NGN} NGN.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 1. Verify user has enough points
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('points_balance')
      .eq('id', user_id)
      .single();

    if (userError || !userData || userData.points_balance < points_cost) {
      return new Response(JSON.stringify({ error: 'Insufficient points balance' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 2. Create Redemption Request (Pending)
    const { data: requestData, error: requestError } = await supabaseClient
      .from('redemption_requests')
      .insert({
        user_id,
        reward_type,
        points_cost,
        naira_value: nairaValue,
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) throw new Error('Failed to create redemption request');

    // 3. Deduct points via point_transactions
    await supabaseClient.from('point_transactions').insert({
      user_id,
      amount: -points_cost,
      transaction_type: reward_type === 'cash' ? 'cashback_redemption' : 'airtime_redemption',
      description: `Redeemed ${points_cost} points for ${nairaValue} NGN ${reward_type}`
    });

    // 4. Call Paga API
    const pagaBaseUrl = Deno.env.get('PAGA_BASE_URL') || 'https://sandbox.paga.com';
    const pagaApiKey = Deno.env.get('PAGA_API_KEY');
    
    if (!pagaApiKey) {
      throw new Error('Paga API Key is missing from secure environment variables.');
    }
    
    const isPagaSuccess = await executePagaApiCall(pagaBaseUrl, pagaApiKey, reward_type, nairaValue, destination_account);

    if (isPagaSuccess) {
      // Update request to completed
      await supabaseClient.from('redemption_requests').update({
        status: 'completed',
        paga_transaction_reference: `PAGA-${Date.now()}`
      }).eq('id', requestData.id);

      return new Response(JSON.stringify({ success: true, message: 'Payout successful' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      // 5. Error Handling: Paga API failed, refund the points!
      await supabaseClient.from('point_transactions').insert({
        user_id,
        amount: points_cost,
        transaction_type: 'variable_bonus', // Reusing transaction type for refund
        description: `Refunded ${points_cost} points due to Paga transaction failure`
      });

      await supabaseClient.from('redemption_requests').update({
        status: 'failed'
      }).eq('id', requestData.id);

      throw new Error('Paga transaction failed. Points have been refunded.');
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper function to execute real Paga API call
async function executePagaApiCall(baseUrl: string, apiKey: string, rewardType: string, amount: number, destination: string): Promise<boolean> {
  try {
    const endpoint = rewardType === 'cash' ? '/moneyTransfer' : '/airtimeTopup';
    
    // Fetch the new secret keys securely
    const pagaSecretKey = Deno.env.get('PAGA_SECRET_KEY');
    const pagaHashKey = Deno.env.get('PAGA_HASH_KEY');
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'api_key': apiKey,
        'secret_key': pagaSecretKey || '', // Ensure it's passed if required
        'hash': pagaHashKey || '' // Ensure it's passed if required
      },
      body: JSON.stringify({
        amount: amount,
        destinationAccount: destination,
        currency: 'NGN',
        reference: `PAGA-${Date.now()}`
      })
    });
    
    // In a real production app, you might want to parse response.json() and check specific success codes
    return response.ok;
  } catch (err) {
    console.error("Paga API Error:", err);
    return false;
  }
}
