
import { useCallback, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { HostApplication } from '@/types/admin';

export function useHostApplications(user: User | null) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all host applications with optimized query
  const getHostApplications = useCallback(async () => {
    if (!user) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch applications with profiles in a single query
      const { data: applications, error: applicationsError } = await supabase
        .from('host_applications')
        .select(`
          *,
          profiles:user_id (
            first_name, 
            last_name, 
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (applicationsError) throw applicationsError;
      
      console.log('Raw host applications data:', applications);
      
      // Process the applications to match the expected format
      const processedApplications = applications.map(application => {
        // Create default profile data
        const defaultProfile = { 
          first_name: null, 
          last_name: null, 
          avatar_url: null 
        };
        
        // Create a new profiles object with safe properties
        let profileData = defaultProfile;
        
        // Check if profiles exists and is not null
        if (application.profiles && typeof application.profiles === 'object') {
          // Type assertion to handle nullable properties safely
          const profiles = application.profiles as { 
            first_name: string | null; 
            last_name: string | null; 
            avatar_url: string | null;
          };
          
          profileData = {
            first_name: profiles.first_name,
            last_name: profiles.last_name,
            avatar_url: profiles.avatar_url
          };
        }
        
        // Simulate email (in a real app, you'd use a secure method)
        const email = `user-${application.user_id.substring(0, 8)}@example.com`;
        
        return {
          ...application,
          profiles: {
            ...profileData,
            email
          }
        } as HostApplication;
      });
      
      console.log('Processed host applications:', processedApplications);
      return processedApplications;
    } catch (err: any) {
      console.error('Error fetching host applications:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load host applications',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update host application status with optimistic updates
  const updateApplicationStatus = useCallback(async (
    applicationId: string,
    status: 'approved' | 'rejected',
    userId: string
  ) => {
    if (!user) return false;
    
    setError(null);
    
    try {
      // Perform the updates in a transaction-like manner
      const updates = [];
      
      // 1. Update application status
      updates.push(
        supabase
          .from('host_applications')
          .update({
            status,
            processed_by: user.id,
            processed_at: new Date().toISOString(),
          })
          .eq('id', applicationId)
      );
      
      // 2. If approved, update user role
      if (status === 'approved') {
        updates.push(
          supabase
            .from('profiles')
            .update({ role: 'host' })
            .eq('id', userId)
        );
      }
      
      // Execute all updates
      const results = await Promise.all(updates);
      
      // Check for errors
      const errors = results.filter(result => result.error !== null);
      if (errors.length > 0) {
        throw new Error(errors[0].error.message);
      }
      
      toast({
        title: 'Success',
        description: `Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });
      
      return true;
    } catch (err: any) {
      console.error(`Error updating application:`, err);
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to ${status} application`,
        variant: 'destructive',
      });
      return false;
    }
  }, [user]);

  return {
    isLoading,
    error,
    getHostApplications,
    updateApplicationStatus
  };
}
