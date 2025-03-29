
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { toast } from './use-toast';
import { updateHostLocation } from '@/utils/geocoding';

interface HostData {
  id?: string;
  space_type?: string;
  monthly_rate?: number;
  security_deposit?: number;
  space_size?: string;
  amenities?: string[];
  service_areas?: string[];
  restrictions?: string[];
  availability_days?: string[];
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

export const useHostUpdate = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const updateHostInfo = async (hostId: string, data: HostData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to update host information",
        variant: "destructive",
      });
      return { success: false, error: "Authentication required" };
    }

    setIsLoading(true);
    try {
      // First update the basic info
      const { error } = await supabase
        .from('hosts')
        .update(data)
        .eq('id', hostId);

      if (error) throw error;

      // If address fields were updated, trigger geocoding
      if (data.address && data.city && data.state && data.zipcode) {
        const geocodingResult = await updateHostLocation(
          hostId,
          data.address,
          data.city,
          data.state,
          data.zipcode
        );

        if (!geocodingResult.success) {
          toast({
            title: "Address Update Warning",
            description: "Your information was saved, but we couldn't geocode your address. Location-based features may not work correctly.",
            variant: "warning",
          });
          
          console.warn("Geocoding error:", geocodingResult.error);
          return { success: true, warning: "Address could not be geocoded" };
        }
      }

      toast({
        title: "Success",
        description: "Your host information has been updated",
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating host info:", error);
      
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating your information",
        variant: "destructive",
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateHostInfo,
    isLoading
  };
};
