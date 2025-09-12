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
    const batchId = url.pathname.split('/').pop();

    if (!batchId) {
      return new Response(
        JSON.stringify({ error: 'Batch ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the complete trace of a batch through the supply chain
    const { data: transfers, error: transfersError } = await supabase
      .from('transfers')
      .select(`
        *,
        from_user:users!from_user_id(name, email, role, city, state),
        to_user:users!to_user_id(name, email, role, city, state),
        batch:batches!batch_id(crop, harvest_date, location)
      `)
      .eq('batch_id', batchId)
      .order('created_at', { ascending: true });

    if (transfersError) {
      console.error('Error fetching transfers:', transfersError);
      return new Response(
        JSON.stringify({ error: transfersError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the original batch info
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select(`
        *,
        farmer:users!farmer_id(name, email, city, state)
      `)
      .eq('id', batchId)
      .single();

    if (batchError) {
      console.error('Error fetching batch:', batchError);
      return new Response(
        JSON.stringify({ error: batchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the supply chain trace
    const trace = [
      {
        stage: 'farmer',
        user: batch.farmer,
        timestamp: batch.created_at,
        location: batch.location,
        crop: batch.crop,
        harvest_date: batch.harvest_date,
        quantity: batch.total_quantity_kg
      }
    ];

    // Add each transfer to the trace
    transfers.forEach(transfer => {
      trace.push({
        stage: transfer.transfer_type,
        from_user: transfer.from_user,
        to_user: transfer.to_user,
        timestamp: transfer.created_at,
        quantity: transfer.quantity_kg,
        status: transfer.status
      });
    });

    return new Response(
      JSON.stringify({ trace, batch }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-trace function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});