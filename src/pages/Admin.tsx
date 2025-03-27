
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
import { Shield, Users, Clock, CheckCircle2, XCircle, UserPlus, Loader2 } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const { 
    data: users = [], 
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['allUsers'],
    queryFn: getAllUsers,
    enabled: !!user && !!isAdmin && activeTab === 'users',
  });

  const updateStatus = useMutation({
    mutationFn: async ({ applicationId, status, userId }: { applicationId: string, status: 'approved' | 'rejected', userId: string }) => {
      setProcessingIds(prev => [...prev, applicationId]);
      try {
        return await updateApplicationStatus(applicationId, status, userId);
      } finally {
        setProcessingIds(prev => prev.filter(id => id !== applicationId));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostApplications'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      
      // Immediately refetch to update the UI
      refetchApplications();
      if (activeTab === 'users') {
        refetchUsers();
      }
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: 'user' | 'host' | 'admin' }) => {
      setProcessingIds(prev => [...prev, userId]);
      try {
        return await updateUserRole(userId, role);
      } finally {
        setProcessingIds(prev => prev.filter(id => id !== userId));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      refetchUsers();
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

  const getPendingApplications = () => {
    return hostApplications.filter((app: HostApplication) => app.status === 'pending');
  };

  const getProcessedApplications = () => {
    return hostApplications.filter((app: HostApplication) => app.status === 'approved' || app.status === 'rejected');
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
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Host Applications</CardTitle>
                    <CardDescription>
                      Review and manage user applications to become hosts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingApplications ? (
                      <div className="text-center py-4 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-parkongo-600" />
                      </div>
                    ) : getPendingApplications().length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                        <h3 className="text-lg font-medium mb-1">No pending applications</h3>
                        <p className="text-gray-500">All host applications have been processed.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Applied On</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getPendingApplications().map((application: HostApplication) => (
                            <TableRow key={application.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={application.profiles?.avatar_url || ''} />
                                    <AvatarFallback>
                                      {application.profiles?.first_name?.[0] || ''}{application.profiles?.last_name?.[0] || ''}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {application.profiles?.first_name} {application.profiles?.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {application.profiles?.email || 'Email not available'}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(application.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                  {application.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-green-500 text-green-600 hover:bg-green-50"
                                    onClick={() => handleApprove(application.id, application.user_id)}
                                    disabled={processingIds.includes(application.id)}
                                  >
                                    {processingIds.includes(application.id) ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                      <CheckCircle2 className="mr-1 h-4 w-4" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                    onClick={() => handleReject(application.id, application.user_id)}
                                    disabled={processingIds.includes(application.id)}
                                  >
                                    {processingIds.includes(application.id) ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                      <XCircle className="mr-1 h-4 w-4" />
                                    )}
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Processed Applications</CardTitle>
                    <CardDescription>
                      History of approved and rejected host applications.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingApplications ? (
                      <div className="text-center py-4 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-parkongo-600" />
                      </div>
                    ) : getProcessedApplications().length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <h3 className="text-lg font-medium mb-1">No processed applications</h3>
                        <p className="text-gray-500">There are no processed host applications yet.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Applied On</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getProcessedApplications().map((application: HostApplication) => (
                            <TableRow key={application.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={application.profiles?.avatar_url || ''} />
                                    <AvatarFallback>
                                      {application.profiles?.first_name?.[0] || ''}{application.profiles?.last_name?.[0] || ''}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {application.profiles?.first_name} {application.profiles?.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {application.profiles?.email || 'Email not available'}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(application.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  application.status === 'approved' ? 'default' : 'destructive'
                                }>
                                  {application.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
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
                    <div className="text-center py-4 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-parkongo-600" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium mb-1">No users found</h3>
                      <p className="text-gray-500">There are no users in the system.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((userData: UserWithProfile) => (
                          <TableRow key={userData.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={userData.avatar_url || ''} />
                                  <AvatarFallback>
                                    {userData.first_name?.[0] || ''}{userData.last_name?.[0] || ''}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {userData.first_name} {userData.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {userData.email || 'Email not available'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(userData.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                userData.role === 'admin' ? 'destructive' : 
                                userData.role === 'host' ? 'default' : 'outline'
                              }>
                                {userData.role || 'user'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Select
                                  defaultValue={userData.role}
                                  onValueChange={(value) => handleRoleChange(userData.id, value as 'user' | 'host' | 'admin')}
                                  disabled={processingIds.includes(userData.id)}
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
                                  disabled={userData.role === 'admin' || processingIds.includes(userData.id)}
                                  className="border-red-500 text-red-600 hover:bg-red-50"
                                >
                                  {processingIds.includes(userData.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : (
                                    <Shield className="mr-1 h-4 w-4" />
                                  )}
                                  Make Admin
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
