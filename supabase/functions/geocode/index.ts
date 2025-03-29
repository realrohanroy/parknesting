
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

interface GeocodeRequest {
  address: string;
  city?: string;
  state?: string;
  zipcode?: string;
  host_id?: string;
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      });
    }

    // Get the request data
    const { address, city, state, zipcode, host_id } = await req.json() as GeocodeRequest;
    
    if (!address) {
      return new Response(
        JSON.stringify({ error: "Address is required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Format the address for geocoding
    let searchAddress = address;
    if (city) searchAddress += `, ${city}`;
    if (state) searchAddress += `, ${state}`;
    if (zipcode) searchAddress += ` ${zipcode}`;
    
    // Use OpenStreetMap's Nominatim API for geocoding (free, no API key required)
    // Set a user-agent as required by Nominatim's usage policy
    const encodedAddress = encodeURIComponent(searchAddress);
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
    
    console.log(`Geocoding address: ${searchAddress}`);
    
    const response = await fetch(geocodeUrl, {
      headers: {
        "User-Agent": "ParkOnGo-Location-Service/1.0",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: "Location not found" }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    const location = data[0];
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    
    console.log(`Found coordinates: ${lat}, ${lon}`);
    
    // If host_id is provided, update the hosts table
    if (host_id) {
      // Create Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Update the host location
      const { data: updateData, error } = await supabase
        .from('hosts')
        .update({ 
          location: `POINT(${lon} ${lat})`,
          // Also update the individual lat/long fields if the app needs them directly
          latitude: lat,
          longitude: lon
        })
        .eq('id', host_id);
      
      if (error) {
        console.error("Error updating host location:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update host location" }),
          { headers: { "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      console.log(`Updated location for host: ${host_id}`);
    }
    
    return new Response(
      JSON.stringify({
        latitude: lat,
        longitude: lon,
        display_name: location.display_name,
        success: true
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
