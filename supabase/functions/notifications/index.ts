
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
    const authHeader = req.headers.get('Authorization') ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          error: "Unauthorized. Please log in." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Process based on the route
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Get user notifications
    if (req.method === "GET" && path === "list") {
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notificationsError) {
        return new Response(
          JSON.stringify({ error: notificationsError.message }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      return new Response(
        JSON.stringify({ notifications }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }
    
    // Mark notifications as read
    else if (req.method === "POST" && path === "mark-read") {
      const { notification_ids } = await req.json();
      
      if (!notification_ids || !Array.isArray(notification_ids)) {
        return new Response(
          JSON.stringify({ error: "Missing notification_ids array" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notification_ids)
        .eq('user_id', user.id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Notifications marked as read"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }
    
    // Mark all notifications as read
    else if (req.method === "POST" && path === "mark-all-read") {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: "All notifications marked as read"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // Unknown endpoint
    return new Response(
      JSON.stringify({ error: "Invalid endpoint" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404 
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
