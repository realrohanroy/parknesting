
// Follow OpenStreetMap Nominatim Usage Policy
// https://operations.osmfoundation.org/policies/nominatim/

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeocodeRequest {
  address: string;
  city: string;
  state: string;
  zipcode: string;
  hostId: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  [key: string]: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase URL or service key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { address, city, state, zipcode, hostId } = await req.json() as GeocodeRequest;
    
    if (!address || !city || !state || !zipcode || !hostId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Format the address for the Nominatim API
    const fullAddress = `${address}, ${city}, ${state} ${zipcode}`;
    
    // We're using encodeURIComponent to properly escape the address
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`;
    
    // Include a User-Agent to comply with Nominatim's usage policy
    // Include your app name and contact email in production
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ParkOnGo-App',
      },
    });
    
    if (!response.ok) {
      console.error('Geocoding API error:', await response.text());
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from geocoding API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const data = await response.json() as NominatimResponse[];
    
    if (!data.length) {
      return new Response(
        JSON.stringify({ error: 'No coordinates found for this address' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    const [result] = data;
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    // Update the host's location in the database
    const { error: updateError } = await supabase
      .from('hosts')
      .update({
        location: `POINT(${lon} ${lat})`,
      })
      .eq('id', hostId);
    
    if (updateError) {
      console.error('Error updating host location:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update host location', details: updateError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        location: { 
          lat,
          lon, 
          point: `POINT(${lon} ${lat})` 
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in geocoding function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
