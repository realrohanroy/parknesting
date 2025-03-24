
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface BookingVehicleInfo {
  make?: string;
  model?: string;
  license_plate?: string;
  color?: string;
}

export interface Booking {
  id: string;
  listing_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed';
  total_price: number;
  vehicle_info?: BookingVehicleInfo;
  created_at: string;
  listings?: {
    title: string;
    address: string;
    city: string;
    images?: string[];
  };
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export function useBookings() {
  const { user } = useAuth();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [hostBookings, setHostBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings for current user (as a renter)
  const fetchUserBookings = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('bookings/user');
      
      if (error) {
        throw new Error(error.message);
      }
      
      setUserBookings(data.bookings || []);
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load your bookings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch bookings for current user (as a host)
  const fetchHostBookings = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('bookings/host');
      
      if (error) {
        throw new Error(error.message);
      }
      
      setHostBookings(data.bookings || []);
    } catch (err) {
      console.error('Error fetching host bookings:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load bookings for your listings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create a new booking
  const createBooking = useCallback(async (
    listingId: string,
    startTime: Date,
    endTime: Date,
    vehicleInfo?: BookingVehicleInfo
  ) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to book a parking spot',
        variant: 'destructive',
      });
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('bookings/create', {
        body: {
          listing_id: listingId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          vehicle_info: vehicleInfo
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: 'Booking Created',
        description: 'Your booking request has been submitted',
      });
      
      return data.booking_id;
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message || 'Failed to create booking',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update booking status
  const updateBookingStatus = useCallback(async (
    bookingId: string,
    status: 'confirmed' | 'rejected' | 'cancelled' | 'completed'
  ) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('bookings/update', {
        body: {
          booking_id: bookingId,
          status
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state based on status
      if (status === 'confirmed' || status === 'rejected' || status === 'completed') {
        // Hosts mainly do these actions, refresh host bookings
        setHostBookings(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status } 
              : booking
          )
        );
      }
      
      // Always update user bookings since users might cancel their own bookings
      setUserBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status } 
            : booking
        )
      );
      
      toast({
        title: 'Success',
        description: `Booking ${status} successfully`,
      });
      
      return true;
    } catch (err) {
      console.error(`Error ${status} booking:`, err);
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message || `Failed to ${status} booking`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Check availability of a parking spot
  const checkAvailability = useCallback(async (
    listingId: string,
    startTime: Date,
    endTime: Date
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('availability', {
        body: {
          listing_id: listingId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString()
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data.available;
    } catch (err) {
      console.error('Error checking availability:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to check spot availability',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    userBookings,
    hostBookings,
    isLoading,
    error,
    fetchUserBookings,
    fetchHostBookings,
    createBooking,
    updateBookingStatus,
    checkAvailability,
  };
}
