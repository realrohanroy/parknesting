
import { useAuth } from '@/hooks/use-auth';
import { useAdminStatus } from '@/hooks/use-admin-status';
import { useHostApplications } from '@/hooks/use-host-applications';
import { useUserManagement } from '@/hooks/use-user-management';
import { HostApplication, UserWithProfile } from '@/types/admin';

// Re-export types for backwards compatibility
export type { HostApplication, UserWithProfile };

export function useAdmin() {
  const { user } = useAuth();
  
  // Compose the functionality from the specialized hooks
  const { isAdmin, isLoading: isStatusLoading, error: statusError, checkAdminStatus } = useAdminStatus(user);
  
  const { 
    isLoading: isHostAppLoading, 
    error: hostAppError,
    getHostApplications, 
    updateApplicationStatus 
  } = useHostApplications(user);
  
  const { 
    isLoading: isUserMgmtLoading, 
    error: userMgmtError,
    getAllUsers, 
    updateUserRole 
  } = useUserManagement(user);

  // Combine loading and error states
  const isLoading = isStatusLoading || isHostAppLoading || isUserMgmtLoading;
  const error = statusError || hostAppError || userMgmtError;

  return {
    isAdmin,
    isLoading,
    error,
    checkAdminStatus,
    getHostApplications,
    updateApplicationStatus,
    getAllUsers,
    updateUserRole,
  };
}
