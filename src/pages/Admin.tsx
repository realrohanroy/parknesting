
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, HostApplication, UserWithProfile } from '@/hooks/use-admin';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';

// Import our new components
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

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const checkAdmin = async () => {
      const isAdminUser = await checkAdminStatus();
      if (!isAdminUser) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    checkAdmin();
  }, [user, navigate, checkAdminStatus]);

  const { 
    data: hostApplications = [], 
    isLoading: isLoadingApplications,
    refetch: refetchApplications
  } = useQuery({
    queryKey: ['hostApplications'],
    queryFn: getHostApplications,
    enabled: !!user && !!isAdmin,
  });

  // Debug logging for host applications
  useEffect(() => {
    console.log('Host applications from query:', hostApplications);
    console.log('Is loading applications:', isLoadingApplications);
    console.log('Is admin:', isAdmin);
  }, [hostApplications, isLoadingApplications, isAdmin]);

  const { 
    data: users = [], 
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['allUsers'],
    queryFn: getAllUsers,
    enabled: !!user && !!isAdmin && activeTab === 'users',
  });

  const wrappedUpdateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected', userId: string) => {
    setProcessingIds(prev => [...prev, applicationId]);
    try {
      return await updateApplicationStatus(applicationId, status, userId);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== applicationId));
    }
  };

  const wrappedUpdateUserRole = async (userId: string, role: 'user' | 'host' | 'admin') => {
    setProcessingIds(prev => [...prev, userId]);
    try {
      return await updateUserRole(userId, role);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== userId));
    }
  };

  if (!user || !isAdmin) {
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
                {isLoadingApplications ? (
                  <p>Loading applications...</p>
                ) : (
                  <>
                    <p className="mb-4 text-sm text-gray-500">
                      {hostApplications.length === 0 
                        ? "No host applications found. Applications will appear here when users apply to become hosts." 
                        : `Showing ${hostApplications.length} host application(s)`}
                    </p>
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
