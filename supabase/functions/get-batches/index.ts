import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const crop = url.searchParams.get('crop');
    const location = url.searchParams.get('location');
    const maxPrice = url.searchParams.get('max_price');

    let query = supabase
      .from('batches')
      .select(`
        *,
        farmer:users!farmer_id(name, email, city, state)
      `)
      .gt('available_quantity_kg', 0)
      .eq('status', 'Available');

    // Apply filters
    if (crop) {
      query = query.ilike('crop', `%${crop}%`);
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    if (maxPrice) {
      query = query.lte('price_per_kg', parseFloat(maxPrice));
    }

    const { data: batches, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching batches:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ batches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-batches function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});