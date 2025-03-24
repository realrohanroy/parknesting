
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // We don't require authentication for this endpoint since checking availability
    // should be possible for non-logged in users

    if (req.method === "POST") {
      const { listing_id, start_time, end_time } = await req.json();
      
      if (!listing_id || !start_time || !end_time) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      // Format dates properly
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);

      // Call our database function to check availability
      const { data, error } = await supabase.rpc(
        'check_listing_availability',
        {
          listing_id_param: listing_id,
          start_time_param: startDate.toISOString(),
          end_time_param: endDate.toISOString()
        }
      );

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      return new Response(
        JSON.stringify({ available: data }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // Unknown request type
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405 
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error: " + (error.message || "Unknown error") 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
