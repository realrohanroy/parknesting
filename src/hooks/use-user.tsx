
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  bio?: string;
}

export function useUser() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Append email from auth to profile data
        const profileWithEmail = {
          ...data,
          email: user.email
        };

        setUserProfile(profileWithEmail);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch user profile'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [user]);

  return { userProfile, isLoading, error };
}
