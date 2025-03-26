
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, HostApplication, UserWithProfile } from '@/hooks/use-admin';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Shield, Users, Clock, CheckCircle2, XCircle, UserPlus } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('hostApplications');

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

  const { data: hostApplications = [], isLoading: isLoadingApplications } = useQuery({
    queryKey: ['hostApplications'],
    queryFn: getHostApplications,
    enabled: !!user && !!isAdmin,
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: getAllUsers,
    enabled: !!user && !!isAdmin && activeTab === 'users',
  });

  const updateStatus = useMutation({
    mutationFn: async ({ applicationId, status, userId }: { applicationId: string, status: 'approved' | 'rejected', userId: string }) => {
      return await updateApplicationStatus(applicationId, status, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostApplications'] });
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: 'user' | 'host' | 'admin' }) => {
      return await updateUserRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  const handleApprove = (applicationId: string, userId: string) => {
    updateStatus.mutate({ applicationId, status: 'approved', userId });
  };

  const handleReject = (applicationId: string, userId: string) => {
    updateStatus.mutate({ applicationId, status: 'rejected', userId });
  };

  const handleRoleChange = (userId: string, role: 'user' | 'host' | 'admin') => {
    updateRole.mutate({ userId, role });
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
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <Shield className="h-6 w-6 text-parkongo-600" />
              <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'users'}
                  onClick={() => setActiveTab('users')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'hostApplications'}
                  onClick={() => setActiveTab('hostApplications')}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Host Applications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter>
            <div className="px-3 py-2">
              <Badge variant="outline" className="w-full justify-center">
                Admin Mode
              </Badge>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            
            {activeTab === 'hostApplications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Host Applications</CardTitle>
                  <CardDescription>
                    Review and manage user applications to become hosts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingApplications ? (
                    <div className="text-center py-4">Loading applications...</div>
                  ) : hostApplications.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium mb-1">No pending applications</h3>
                      <p className="text-gray-500">There are no host applications to review at this time.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hostApplications.map((application: HostApplication) => (
                        <div key={application.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={application.profiles?.avatar_url || ''} />
                                <AvatarFallback>
                                  {application.profiles?.first_name?.[0] || ''}{application.profiles?.last_name?.[0] || ''}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {application.profiles?.first_name} {application.profiles?.last_name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {application.profiles?.email || 'Email not available'}
                                </p>
                                <div className="flex items-center mt-1">
                                  <Badge variant={
                                    application.status === 'pending' ? 'outline' : 
                                    application.status === 'approved' ? 'default' : 'destructive'
                                  }>
                                    {application.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500 ml-2">
                                    Applied on {new Date(application.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {application.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-500 text-green-600 hover:bg-green-50"
                                  onClick={() => handleApprove(application.id, application.user_id)}
                                  disabled={updateStatus.isPending}
                                >
                                  <CheckCircle2 className="mr-1 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500 text-red-600 hover:bg-red-50"
                                  onClick={() => handleReject(application.id, application.user_id)}
                                  disabled={updateStatus.isPending}
                                >
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    Total applications: {hostApplications.length}
                  </p>
                </CardFooter>
              </Card>
            )}
            
            {activeTab === 'users' && (
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user roles and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="text-center py-4">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium mb-1">No users found</h3>
                      <p className="text-gray-500">There are no users in the system.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((userData: UserWithProfile) => (
                        <div key={userData.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={userData.avatar_url || ''} />
                                <AvatarFallback>
                                  {userData.first_name?.[0] || ''}{userData.last_name?.[0] || ''}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {userData.first_name} {userData.last_name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {userData.email || 'Email not available'}
                                </p>
                                <div className="flex items-center mt-1">
                                  <Badge variant={
                                    userData.role === 'admin' ? 'destructive' : 
                                    userData.role === 'host' ? 'default' : 'outline'
                                  }>
                                    {userData.role || 'user'}
                                  </Badge>
                                  <span className="text-xs text-gray-500 ml-2">
                                    Joined on {new Date(userData.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 items-center">
                              <Select
                                defaultValue={userData.role}
                                onValueChange={(value) => handleRoleChange(userData.id, value as 'user' | 'host' | 'admin')}
                                disabled={updateRole.isPending}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="host">Host</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleChange(userData.id, 'admin')}
                                disabled={userData.role === 'admin' || updateRole.isPending}
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <Shield className="mr-1 h-4 w-4" />
                                Make Admin
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    Total users: {users.length}
                  </p>
                </CardFooter>
              </Card>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
      
      <Footer />
    </div>
  );
};

export default Admin;
