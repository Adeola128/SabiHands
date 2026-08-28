import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, description, type } = await req.json();

    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key is missing");
    }

    const prompt = `You are a volunteer management expert. Based on the following gig details, suggest a reasonable number of TOTAL hours a volunteer will spend completing it.
    
    Gig Title: ${title}
    Gig Type: ${type}
    Description: ${description}
    
    Analyze the tasks described. For a physical gig, consider travel/setup time. For a skilled gig, consider research, execution, and review time.
    
    Respond with ONLY an integer representing the total hours (e.g., 5). If it's a multi-day event, sum the hours. If it's unclear, default to a reasonable minimum (e.g. 2). Do not include any text, just the number.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 10,
      }),
    });

    const data = await response.json();
    const suggestedHoursText = data.choices?.[0]?.message?.content?.trim();
    
    // Parse the integer, default to 4 if it fails
    const hours = parseInt(suggestedHoursText) || 4;

    return new Response(
      JSON.stringify({ hours }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
