
import { User } from '@supabase/supabase-js';

export type HostApplication = {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
};

export type UserWithProfile = {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface AdminState {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}
