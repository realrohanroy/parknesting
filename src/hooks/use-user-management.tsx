
import { useCallback, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserWithProfile } from '@/types/admin';

export function useUserManagement(user: User | null) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users with their profiles using a single optimized query
  const getAllUsers = useCallback(async () => {
    if (!user) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, first_name, last_name, avatar_url, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Add email for each user (simulated)
      const usersWithEmail = data.map(profile => {
        // In a real implementation, you would use a secure method to fetch the email
        const email = `user-${profile.id.substring(0, 8)}@example.com`;
        
        return {
          ...profile,
          email
        } as UserWithProfile;
      });
      
      return usersWithEmail;
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update user role with immediate UI feedback
  const updateUserRole = useCallback(async (
    userId: string,
    role: 'user' | 'host' | 'admin'
  ) => {
    if (!user) return false;
    
    setError(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `User role updated to ${role} successfully`,
      });
      
      return true;
    } catch (err: any) {
      console.error(`Error updating user role:`, err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
      return false;
    }
  }, [user]);

  return {
    isLoading,
    error,
    getAllUsers,
    updateUserRole
  };
}
