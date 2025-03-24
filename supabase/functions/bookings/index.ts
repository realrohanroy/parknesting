
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define interfaces
interface BookingRequest {
  listing_id: string;
  start_time: string;
  end_time: string;
  vehicle_id?: string; 
  vehicle_info?: {
    make?: string;
    model?: string;
    license_plate?: string;
    color?: string;
  };
}

interface BookingUpdateRequest {
  booking_id: string;
  status: 'confirmed' | 'rejected' | 'cancelled' | 'completed';
}

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

    if (req.method === "POST") {
      const body = await req.json();

      // Create a new booking
      if (path === "create") {
        const { listing_id, start_time, end_time, vehicle_id, vehicle_info }: BookingRequest = body;
        
        if (!listing_id || !start_time || !end_time) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400 
            }
          );
        }

        // Format dates properly for the database
        const startDate = new Date(start_time);
        const endDate = new Date(end_time);

        // Calculate duration and validate
        const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        if (durationHours <= 0) {
          return new Response(
            JSON.stringify({ error: "End time must be after start time" }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400 
            }
          );
        }

        try {
          // Use our database function to create a booking
          const { data, error: bookingError } = await supabase.rpc(
            'create_booking',
            {
              listing_id_param: listing_id,
              start_time_param: startDate.toISOString(),
              end_time_param: endDate.toISOString(),
              vehicle_info_param: vehicle_info ? JSON.stringify(vehicle_info) : null
            }
          );

          if (bookingError) {
            throw bookingError;
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: "Booking created successfully",
              booking_id: data
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 201 
            }
          );
        } catch (error) {
          console.error("Error creating booking:", error);
          return new Response(
            JSON.stringify({ 
              error: error.message || "Failed to create booking" 
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400 
            }
          );
        }
      }
      
      // Update booking status
      else if (path === "update") {
        const { booking_id, status }: BookingUpdateRequest = body;
        
        if (!booking_id || !status) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400 
            }
          );
        }

        try {
          // Use database function to update booking status
          const { data, error: updateError } = await supabase.rpc(
            'update_booking_status',
            {
              booking_id_param: booking_id,
              new_status: status
            }
          );

          if (updateError) {
            throw updateError;
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: `Booking ${status} successfully`
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200 
            }
          );
        } catch (error) {
          console.error("Error updating booking:", error);
          return new Response(
            JSON.stringify({ 
              error: error.message || "Failed to update booking" 
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400 
            }
          );
        }
      }
    }
    
    // Get user bookings
    else if (req.method === "GET" && path === "user") {
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          listing_id,
          user_id,
          start_time,
          end_time,
          status,
          total_price,
          vehicle_info,
          created_at,
          listings:listing_id (
            title,
            address,
            city,
            images
          )
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (bookingsError) {
        return new Response(
          JSON.stringify({ error: bookingsError.message }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      return new Response(
        JSON.stringify({ bookings }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }
    
    // Get host bookings
    else if (req.method === "GET" && path === "host") {
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id')
        .eq('profile_id', user.id);

      if (listingsError) {
        return new Response(
          JSON.stringify({ error: listingsError.message }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      if (!listings || listings.length === 0) {
        return new Response(
          JSON.stringify({ bookings: [] }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      }

      const listingIds = listings.map(l => l.id);
      
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          listing_id,
          user_id,
          start_time,
          end_time,
          status,
          total_price,
          vehicle_info,
          created_at,
          listings:listing_id (
            title,
            address,
            city,
            images
          ),
          profiles:user_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .in('listing_id', listingIds)
        .order('start_time', { ascending: false });

      if (bookingsError) {
        return new Response(
          JSON.stringify({ error: bookingsError.message }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      return new Response(
        JSON.stringify({ bookings }),
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
