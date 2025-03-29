
import { supabase } from "@/integrations/supabase/client";

export interface GeocodingResult {
  success: boolean;
  location?: {
    lat: number;
    lon: number;
    point: string;
  };
  error?: string;
  details?: string;
}

/**
 * Updates a host's location by geocoding their address
 * @param hostId - The ID of the host record
 * @param address - Street address
 * @param city - City name
 * @param state - State/province
 * @param zipcode - Postal/zip code
 * @returns Geocoding result with coordinates if successful
 */
export const updateHostLocation = async (
  hostId: string,
  address: string,
  city: string,
  state: string,
  zipcode: string
): Promise<GeocodingResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('geocode', {
      body: {
        hostId,
        address,
        city,
        state,
        zipcode
      }
    });

    if (error) {
      console.error('Error calling geocode function:', error);
      return {
        success: false,
        error: 'Failed to call geocoding service',
        details: error.message
      };
    }

    return data as GeocodingResult;
  } catch (err) {
    console.error('Exception in updateHostLocation:', err);
    return {
      success: false,
      error: 'Exception in geocoding service',
      details: err.message
    };
  }
}
