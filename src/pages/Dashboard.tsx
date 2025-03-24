
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { User, Car, Calendar, CreditCard, Clock, ParkingCircle, Settings, Bell, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Zod schemas for form validation
const ProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

const VehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().optional(),
  color: z.string().min(1, "Color is required"),
  license_plate: z.string().min(1, "License plate is required"),
});

// Types
type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string | null;
  bio: string | null;
  created_at: string;
};

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  license_plate: string | null;
  created_at: string;
};

type Booking = {
  id: string;
  listing_id: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
  listing: {
    title: string;
  };
};

type Favorite = {
  id: string;
  listing_id: string;
  listing: {
    title: string;
    address: string;
  };
  created_at: string;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hostApplicationSubmitted, setHostApplicationSubmitted] = useState(false);
  const [hostApplicationStatus, setHostApplicationStatus] = useState<string | null>(null);
  
  // Fetch user and check if logged in
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // If not logged in, redirect to auth page
  useEffect(() => {
    if (session === null) {
      navigate('/auth');
    }
  }, [session, navigate]);

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!session?.user?.id,
  });

  // Fetch host application status
  useQuery({
    queryKey: ['hostApplication'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('host_applications')
        .select('status')
        .eq('user_id', session.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setHostApplicationStatus(data.status);
        setHostApplicationSubmitted(true);
      }
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Fetch user vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: !!session?.user?.id,
  });

  // Fetch bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('id, listing_id, start_time, end_time, status, total_price, listing:listings(title)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!session?.user?.id,
  });

  // Fetch favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('id, listing_id, created_at, listing:listings(title, address)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Favorite[];
    },
    enabled: !!session?.user?.id,
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: '',
      bio: profile?.bio || '',
    },
  });

  // Update profile values when profile data loads
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        phone: '',
      });
    }
  }, [profile, profileForm]);

  // Vehicle form
  const vehicleForm = useForm<z.infer<typeof VehicleSchema>>({
    resolver: zodResolver(VehicleSchema),
    defaultValues: {
      make: '',
      model: '',
      year: '',
      color: '',
      license_plate: '',
    },
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (values: z.infer<typeof ProfileSchema>) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          bio: values.bio,
        })
        .eq('id', session.user.id);
      
      if (error) throw error;
      return values;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add vehicle mutation
  const addVehicle = useMutation({
    mutationFn: async (values: z.infer<typeof VehicleSchema>) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('vehicles')
        .insert({
          user_id: session.user.id,
          make: values.make,
          model: values.model,
          year: values.year ? parseInt(values.year) : null,
          color: values.color,
          license_plate: values.license_plate,
        });
      
      if (error) throw error;
      return values;
    },
    onSuccess: () => {
      toast({
        title: "Vehicle Added",
        description: "Your vehicle has been added successfully.",
      });
      vehicleForm.reset();
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add vehicle: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Host application mutation
  const applyForHost = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('host_applications')
        .insert({
          user_id: session.user.id,
        });
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      setHostApplicationSubmitted(true);
      setHostApplicationStatus('pending');
      toast({
        title: "Application Submitted",
        description: "Your host application has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ['hostApplication'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit host application: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (values: z.infer<typeof ProfileSchema>) => {
    updateProfile.mutate(values);
  };

  // Handle vehicle form submission
  const onVehicleSubmit = (values: z.infer<typeof VehicleSchema>) => {
    addVehicle.mutate(values);
  };

  // Handle host application
  const handleHostApplication = () => {
    applyForHost.mutate();
  };

  // Handle logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: `Failed to log out: ${error.message}`,
        variant: "destructive",
      });
    } else {
      navigate('/');
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    }
  };

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.first_name || ''} />
                    <AvatarFallback>
                      {profile?.first_name?.[0] || ''}{profile?.last_name?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">{session.user.email}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Member since {new Date(profile?.created_at || '').toLocaleDateString()}
                  </p>
                  
                  {/* Host status / application button */}
                  {profile?.role === 'host' ? (
                    <div className="mt-3 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Host
                    </div>
                  ) : hostApplicationSubmitted ? (
                    <div className="mt-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Host application {hostApplicationStatus}
                    </div>
                  ) : (
                    <button 
                      onClick={handleHostApplication}
                      className="mt-3 px-3 py-1 bg-parkongo-100 text-parkongo-700 text-xs rounded-full hover:bg-parkongo-200 transition-colors"
                    >
                      Become a Host
                    </button>
                  )}
                </div>
                
                <nav className="space-y-2">
                  <a href="#profile" className="flex items-center gap-3 p-2.5 rounded-lg bg-parkongo-50 text-parkongo-700 font-medium">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </a>
                  <a href="#bookings" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <Calendar className="h-5 w-5" />
                    <span>Bookings</span>
                  </a>
                  <a href="#vehicles" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <Car className="h-5 w-5" />
                    <span>Vehicles</span>
                  </a>
                  <a href="#favorites" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <ParkingCircle className="h-5 w-5" />
                    <span>Favorite Spaces</span>
                  </a>
                  <a href="#payments" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Methods</span>
                  </a>
                  <a href="#notifications" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </a>
                  <a href="#settings" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-50 text-red-600 font-medium w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="overview">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Welcome Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Welcome back, {profile?.first_name || 'User'}!</CardTitle>
                      <CardDescription>
                        Here's a summary of your recent activity and upcoming bookings.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  {/* Recent Bookings */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {bookingsLoading ? (
                        <div className="p-4 text-center">Loading bookings...</div>
                      ) : bookings.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No bookings found.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Space</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bookings.slice(0, 3).map((booking) => (
                                <TableRow key={booking.id}>
                                  <TableCell className="font-medium">{booking.id.split('-')[0]}</TableCell>
                                  <TableCell>{booking.listing?.title || 'Unknown'}</TableCell>
                                  <TableCell>{new Date(booking.start_time).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                    {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      booking.status === 'completed' 
                                        ? 'bg-green-100 text-green-800' 
                                        : booking.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : booking.status === 'cancelled'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                  </TableCell>
                                  <TableCell>₹{booking.total_price}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-3">
                      <Button variant="outline" className="w-full">View All Bookings</Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Total Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{bookings.length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Favorite Spaces</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{favorites.length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Registered Vehicles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{vehicles.length}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and contact information.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                          <FormField
                            control={profileForm.control}
                            name="first_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your first name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="last_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your last name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>About Me</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us a little about yourself..."
                                    className="min-h-24"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            customStyle="primary"
                            isLoading={updateProfile.isPending}
                          >
                            Save Changes
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Vehicles Tab */}
                <TabsContent value="vehicles" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Vehicles</CardTitle>
                      <CardDescription>
                        Manage your registered vehicles for easy booking.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {vehiclesLoading ? (
                        <div className="text-center py-4">Loading vehicles...</div>
                      ) : vehicles.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No vehicles registered yet.</div>
                      ) : (
                        <div className="space-y-4">
                          {vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <Car className="h-10 w-10 text-gray-400" />
                                <div>
                                  <h4 className="font-medium">{vehicle.make} {vehicle.model}</h4>
                                  <p className="text-sm text-gray-500">
                                    {vehicle.license_plate} • {vehicle.color}
                                    {vehicle.year ? ` • ${vehicle.year}` : ''}
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">Edit</Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Add New Vehicle</CardTitle>
                      <CardDescription>
                        Register a new vehicle to use with Parkongo.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...vehicleForm}>
                        <form onSubmit={vehicleForm.handleSubmit(onVehicleSubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={vehicleForm.control}
                              name="make"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Vehicle Make</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Honda, Toyota" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={vehicleForm.control}
                              name="model"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Vehicle Model</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Civic, Camry" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={vehicleForm.control}
                              name="year"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Year (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. 2023" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={vehicleForm.control}
                              name="color"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Vehicle Color</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Blue, Silver" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={vehicleForm.control}
                              name="license_plate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>License Plate</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. ABC-1234" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <Button 
                            type="submit" 
                            customStyle="primary"
                            isLoading={addVehicle.isPending}
                          >
                            Add Vehicle
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
