
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ShieldCheck, UserX, Users } from 'lucide-react';
import { useAdmin, HostApplication } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    isAdmin, 
    isLoading, 
    checkAdminStatus, 
    getHostApplications, 
    updateApplicationStatus 
  } = useAdmin();
  const [activeTab, setActiveTab] = useState('host-applications');
  const [hostApplications, setHostApplications] = useState<HostApplication[]>([]);
  const [applicationLoading, setApplicationLoading] = useState(false);

  // Check if user is admin on component mount
  useEffect(() => {
    const checkAdmin = async () => {
      const isAdminUser = await checkAdminStatus();
      if (!isAdminUser) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    };
    
    if (user) {
      checkAdmin();
    } else {
      navigate('/auth');
    }
  }, [user, checkAdminStatus, navigate]);

  // Fetch host applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (isAdmin) {
        setApplicationLoading(true);
        const applications = await getHostApplications();
        setHostApplications(applications);
        setApplicationLoading(false);
      }
    };
    
    fetchApplications();
  }, [isAdmin, getHostApplications]);

  // Handle application status update
  const handleStatusUpdate = async (applicationId: string, status: 'approved' | 'rejected', userId: string) => {
    const success = await updateApplicationStatus(applicationId, status, userId);
    if (success) {
      // Update local state to reflect changes
      setHostApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status } 
            : app
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-500">Manage Parkongo platform operations</p>
            </div>
            <Badge className="bg-red-500">Admin Access</Badge>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:w-[400px] mb-6">
              <TabsTrigger value="host-applications" className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Host Applications
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </TabsTrigger>
            </TabsList>
            
            {/* Host Applications Tab */}
            <TabsContent value="host-applications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Host Applications</CardTitle>
                  <CardDescription>
                    Review and process applications from users who want to become hosts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {applicationLoading ? (
                    <div className="text-center py-8">Loading applications...</div>
                  ) : hostApplications.length === 0 ? (
                    <div className="text-center py-8">
                      <ShieldAlert className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium mb-2">No pending applications</h3>
                      <p className="text-gray-500">
                        There are no host applications requiring your attention.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applied On</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hostApplications.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={application.profiles?.avatar_url || ''} />
                                  <AvatarFallback>
                                    {application.profiles?.first_name?.[0] || ''}
                                    {application.profiles?.last_name?.[0] || ''}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {application.profiles?.first_name} {application.profiles?.last_name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {application.profiles?.email && 
                                      application.profiles.email.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  application.status === 'pending'
                                    ? 'bg-yellow-500'
                                    : application.status === 'approved'
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                }
                              >
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(application.created_at), 'PPP')}
                            </TableCell>
                            <TableCell className="text-right">
                              {application.status === 'pending' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                    onClick={() => handleStatusUpdate(
                                      application.id, 
                                      'rejected',
                                      application.user_id
                                    )}
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                    onClick={() => handleStatusUpdate(
                                      application.id, 
                                      'approved',
                                      application.user_id
                                    )}
                                  >
                                    <ShieldCheck className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-gray-500 text-sm">
                                  {application.status === 'approved' ? 'Approved' : 'Rejected'}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Users Management Tab - placeholder for future implementation */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                  <p className="text-gray-500">
                    User management features will be available in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
