
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HostApplication } from '@/types/admin';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';

// Import our components
import AdminSidebar from '@/components/admin/AdminSidebar';
import HostApplicationsManager from '@/components/admin/HostApplicationsManager';
import UserManager from '@/components/admin/UserManager';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    isAdmin, 
    checkAdminStatus, 
    getHostApplications, 
    updateApplicationStatus,
    getAllUsers,
    updateUserRole 
  } = useAdmin();
  
  const [activeTab, setActiveTab] = useState('hostApplications');
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

  // Add direct check for any host applications
  const checkForApplications = async () => {
    if (!user) return;
    
    try {
      console.log('Direct check for any host applications');
      const { data, error } = await supabase
        .from('host_applications')
        .select('id, status')
        .limit(5);
        
      if (error) throw error;
      
      console.log('Direct check result:', data);
      console.log('Number of applications found:', data?.length || 0);
    } catch (err) {
      console.error('Error in direct application check:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const checkAdmin = async () => {
      const isAdminUser = await checkAdminStatus();
      console.log('Is admin user:', isAdminUser);
      
      if (!isAdminUser) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate('/');
      } else {
        // If user is admin, do a direct check for applications
        checkForApplications();
      }
    };

    checkAdmin();
  }, [user, navigate, checkAdminStatus]);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    console.log('Force refresh triggered');
    setLastRefreshTime(Date.now());
  }, []);

  // Manual refetch function
  const refetchApplications = useCallback(() => {
    console.log('Manual refetch of host applications triggered');
    hostApplicationsRefetch();
  }, []);

  // Query for host applications
  const { 
    data: hostApplications = [], 
    isLoading: isLoadingApplications,
    refetch: hostApplicationsRefetch,
    error: hostApplicationsError
  } = useQuery({
    queryKey: ['hostApplications', lastRefreshTime],
    queryFn: getHostApplications,
    enabled: !!user && !!isAdmin,
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
    retry: 3, // Retry failed requests up to 3 times
  });

  // Debug logging for host applications
  useEffect(() => {
    console.log('Host applications from query:', hostApplications);
    console.log('Host applications length:', hostApplications?.length || 0);
    console.log('Is loading applications:', isLoadingApplications);
    console.log('Applications error:', hostApplicationsError);
    console.log('Is admin:', isAdmin);
  }, [hostApplications, isLoadingApplications, hostApplicationsError, isAdmin]);

  // Force a refresh on mount and when tab changes
  useEffect(() => {
    if (activeTab === 'hostApplications') {
      console.log('Active tab is hostApplications, triggering refresh');
      const timer = setTimeout(() => {
        forceRefresh();
        refetchApplications();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, refetchApplications, forceRefresh]);

  // Set up periodic refresh
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      if (activeTab === 'hostApplications') {
        console.log('Periodic refresh triggered');
        forceRefresh();
        refetchApplications();
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(refreshTimer);
  }, [activeTab, refetchApplications, forceRefresh]);

  const refetchUsers = useCallback(() => {
    console.log('Manual refetch of users triggered');
    usersRefetch();
  }, []);

  const { 
    data: users = [], 
    isLoading: isLoadingUsers,
    refetch: usersRefetch
  } = useQuery({
    queryKey: ['allUsers', lastRefreshTime],
    queryFn: getAllUsers,
    enabled: !!user && !!isAdmin && activeTab === 'users',
    refetchOnWindowFocus: true,
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const wrappedUpdateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected', userId: string) => {
    console.log(`Updating application status: ${applicationId} to ${status}`);
    setProcessingIds(prev => [...prev, applicationId]);
    try {
      const result = await updateApplicationStatus(applicationId, status, userId);
      console.log('Update application status result:', result);
      
      // Force refresh after update
      setTimeout(() => {
        forceRefresh();
        refetchApplications();
      }, 300);
      
      return result;
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== applicationId));
    }
  };

  const wrappedUpdateUserRole = async (userId: string, role: 'user' | 'host' | 'admin') => {
    console.log(`Updating user role: ${userId} to ${role}`);
    setProcessingIds(prev => [...prev, userId]);
    try {
      const result = await updateUserRole(userId, role);
      console.log('Update user role result:', result);
      
      setTimeout(() => {
        forceRefresh();
        refetchUsers();
        // Also refresh applications in case there are relationship changes
        refetchApplications();
      }, 300);
      
      return result;
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== userId));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to access this page</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <SidebarProvider defaultOpen={true}>
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <SidebarInset className="p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            
            {activeTab === 'hostApplications' && (
              <>
                {hostApplicationsError ? (
                  <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
                    <p className="font-medium mb-2">Error loading applications</p>
                    <p className="text-sm">{String(hostApplicationsError)}</p>
                    <button 
                      onClick={refetchApplications} 
                      className="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-gray-500">
                        {hostApplications.length === 0 
                          ? "No host applications found. Applications will appear here when users apply to become hosts." 
                          : `Showing ${hostApplications.length} host application(s)`}
                      </p>
                      <button 
                        onClick={() => {
                          forceRefresh();
                          refetchApplications();
                          checkForApplications();
                        }}
                        className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                      </button>
                    </div>
                    <HostApplicationsManager
                      hostApplications={hostApplications}
                      isLoadingApplications={isLoadingApplications}
                      processingIds={processingIds}
                      updateApplicationStatus={wrappedUpdateApplicationStatus}
                      refetchApplications={refetchApplications}
                    />
                  </>
                )}
              </>
            )}
            
            {activeTab === 'users' && (
              <UserManager
                users={users}
                isLoadingUsers={isLoadingUsers}
                processingIds={processingIds}
                updateUserRole={wrappedUpdateUserRole}
                refetchUsers={refetchUsers}
              />
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
      
      <Footer />
    </div>
  );
};

export default Admin;
