import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/Button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  Car, 
  Calendar, 
  CreditCard, 
  Clock, 
  ParkingCircle, 
  Settings, 
  Bell, 
  LogOut,
  Home,
  Star
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { BookingsList } from '@/components/BookingsList';
import { Badge } from '@/components/ui/badge';

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

type ListingType = {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  hourly_rate: number;
  images: any[];
  is_active?: boolean;
  created_at: string;
}

type ListingStats = {
  listing_id: string;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  average_rating: number;
  review_count: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [hostApplicationSubmitted, setHostApplicationSubmitted] = useState(false);
  const [hostApplicationStatus, setHostApplicationStatus] = useState<string | null>(null);
  const [listingStatsMap, setListingStatsMap] = useState<Record<string, ListingStats>>({});

  // Get tab from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'profile', 'vehicles', 'bookings', 'listings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);
  
  // If not logged in, redirect to auth page
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  // Fetch host application status
  useQuery({
    queryKey: ['hostApplication'],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('host_applications')
        .select('status')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setHostApplicationStatus(data.status);
        setHostApplicationSubmitted(true);
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: !!user?.id,
  });

  // Fetch user listings (if host)
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ListingType[];
    },
    enabled: !!user?.id && profile?.role === 'host',
  });

  // Compute listing stats
  useEffect(() => {
    const fetchStatsForListings = async () => {
      if (!listings.length || !user?.id) return;
      
      // Create placeholder stats for each listing
      const statsMap: Record<string, ListingStats> = {};
      
      for (const listing of listings) {
        // Fetch booking stats for this listing
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, status')
          .eq('listing_id', listing.id);
        
        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          continue;
        }
        
        // Fetch reviews for this listing
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('listing_id', listing.id);
        
        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          continue;
        }
        
        // Calculate stats
        const totalBookings = bookings?.length || 0;
        const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
        const cancelledBookings = bookings?.filter(b => b.status === 'cancelled').length || 0;
        const reviewCount = reviews?.length || 0;
        const averageRating = reviewCount > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
          : 0;
        
        statsMap[listing.id] = {
          listing_id: listing.id,
          total_bookings: totalBookings,
          completed_bookings: completedBookings,
          cancelled_bookings: cancelled_bookings,
          review_count: reviewCount,
          average_rating: averageRating
        };
      }
      
      setListingStatsMap(statsMap);
    };
    
    fetchStatsForListings();
  }, [listings, user?.id]);

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
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          bio: values.bio,
        })
        .eq('id', user.id);
      
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
    onError: (error: any) => {
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
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('vehicles')
        .insert({
          user_id: user.id,
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
    onError: (error: any) => {
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
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('host_applications')
        .insert({
          user_id: user.id,
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
    onError: (error: any) => {
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
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to log out: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Calculate active bookings for all listings
  const getActiveBookingsCount = () => {
    return Object.values(listingStatsMap).reduce((acc, stat) => 
      acc + (stat.total_bookings - stat.completed_bookings - stat.cancelled_bookings), 0);
  };

  // Calculate total reviews count
  const getTotalReviewsCount = () => {
    return Object.values(listingStatsMap).reduce((acc, stat) => 
      acc + stat.review_count, 0);
  };

  if (!user) {
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
                  <p className="text-gray-500 text-sm mt-1">{user.email}</p>
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
                  <a 
                    href="#overview" 
                    className={`flex items-center gap-3 p-2.5 rounded-lg ${activeTab === 'overview' ? 'bg-parkongo-50 text-parkongo-700' : 'hover:bg-gray-50 text-gray-700'} font-medium`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <Home className="h-5 w-5" />
                    <span>Overview</span>
                  </a>
                  <a 
                    href="#profile" 
                    className={`flex items-center gap-3 p-2.5 rounded-lg ${activeTab === 'profile' ? 'bg-parkongo-50 text-parkongo-700' : 'hover:bg-gray-50 text-gray-700'} font-medium`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </a>
                  <a 
                    href="#bookings" 
                    className={`flex items-center gap-3 p-2.5 rounded-lg ${activeTab === 'bookings' ? 'bg-parkongo-50 text-parkongo-700' : 'hover:bg-gray-50 text-gray-700'} font-medium`}
                    onClick={() => setActiveTab('bookings')}
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Bookings</span>
                  </a>
                  <a 
                    href="#vehicles" 
                    className={`flex items-center gap-3 p-2.5 rounded-lg ${activeTab === 'vehicles' ? 'bg-parkongo-50 text-parkongo-700' : 'hover:bg-gray-50 text-gray-700'} font-medium`}
                    onClick={() => setActiveTab('vehicles')}
                  >
                    <Car className="h-5 w-5" />
                    <span>Vehicles</span>
                  </a>
                  {profile?.role === 'host' && (
                    <a 
                      href="#listings" 
                      className={`flex items-center gap-3 p-2.5 rounded-lg ${activeTab === 'listings' ? 'bg-parkongo-50 text-parkongo-700' : 'hover:bg-gray-50 text-gray-700'} font-medium`}
                      onClick={() => setActiveTab('listings')}
                    >
                      <ParkingCircle className="h-5 w-5" />
                      <span>My Listings</span>
                    </a>
                  )}
                  <a href="#favorites" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <Star className="h-5 w-5" />
                    <span>Favorites</span>
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
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  {profile?.role === 'host' ? (
                    <TabsTrigger value="listings">Listings</TabsTrigger>
                  ) : (
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                  )}
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
                  
                  {/* Host Section - Only shown for hosts */}
                  {profile?.role === 'host' && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Host Dashboard</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {/* Host Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                          <div className="bg-parkongo-50 p-4 rounded-lg">
                            <h3 className="text-sm text-gray-500 mb-1">Listed Spaces</h3>
                            <p className="text-2xl font-bold">{listings.length}</p>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-sm text-gray-500 mb-1">Active Bookings</h3>
                            <p className="text-2xl font-bold">
                              {getActiveBookingsCount()}
                            </p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-sm text-gray-500 mb-1">Total Reviews</h3>
                            <p className="text-2xl font-bold">
                              {getTotalReviewsCount()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="p-4 pt-0">
                          <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/for-hosts')}
                            >
                              + Add New Listing
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab('bookings')}
                            >
                              Manage Bookings
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Bookings Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BookingsList type="user" />
                    </CardContent>
                    <CardFooter className="pt-3">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setActiveTab('bookings')}
                      >
                        View All Bookings
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Vehicles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{vehicles.length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Host Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-medium">
                          {profile?.role === 'host' 
                            ? "Active Host" 
                            : hostApplicationSubmitted 
                              ? `Application ${hostApplicationStatus}` 
                              : "Not a host"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Joined</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-medium">
                          {new Date(profile?.created_at || '').toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Bookings Tab */}
                <TabsContent value="bookings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Bookings</CardTitle>
                      <CardDescription>
                        View and manage your parking space bookings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="user">
                        <TabsList className="mb-4">
                          <TabsTrigger value="user">My Bookings</TabsTrigger>
                          {profile?.role === 'host' && (
                            <TabsTrigger value="host">Host Bookings</TabsTrigger>
                          )}
                        </TabsList>
                        
                        <TabsContent value="user">
                          <BookingsList type="user" />
                        </TabsContent>
                        
                        {profile?.role === 'host' && (
                          <TabsContent value="host">
                            <BookingsList type="host" />
                          </TabsContent>
                        )}
                      </Tabs>
                    </CardContent>
                  </Card>
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

                {/* Listings Tab (Only for hosts) */}
                {profile?.role === 'host' && (
                  <TabsContent value="listings" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Parking Spaces</CardTitle>
                        <CardDescription>
                          Manage your listed parking spaces and view their performance.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {listingsLoading ? (
                          <div className="text-center py-4">Loading listings...</div>
                        ) : listings.length === 0 ? (
                          <div className="text-center py-8">
                            <ParkingCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <h3 className="text-lg font-medium mb-1">No parking spaces listed</h3>
                            <p className="text-gray-500 mb-4">Start hosting by adding your first parking space.</p>
                            <Button 
                              customStyle="primary"
                              onClick={() => navigate('/for-hosts')}
                            >
                              Add Your First Listing
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {listings.map((listing) => {
                              const stats = listingStatsMap[listing.id] || {
                                total_bookings: 0,
                                completed_bookings: 0,
                                cancelled_bookings: 0,
                                average_rating: 0,
                                review_count: 0
                              };
                              
                              return (
                                <div key={listing.id} className="border rounded-lg overflow-hidden">
                                  <div className="md:flex">
                                    <div className="md:w-1/3 h-48 md:h-auto relative">
                                      <img 
                                        src={listing.images?.[0] || '/placeholder.svg'} 
                                        alt={listing.title}
                                        className="h-full w-full object-cover" 
                                      />
                                    </div>
                                    <div className="p-4 md:w-2/3">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h3 className="text-lg font-semibold">{listing.title}</h3>
                                          <p className="text-gray-500 text-sm">
                                            {listing.address}, {listing.city}, {listing.state}
                                          </p>
                                        </div>
                                        <Badge 
                                          variant={listing.is_active ? "outline" : "secondary"}
                                          className={listing.is_active ? "bg-green-100 text-green-800" : ""}
                                        >
                                          {listing.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2 mt-4">
                                        <div className="text-center">
                                          <p className="text-2xl font-bold">{stats.total_bookings}</p>
                                          <p className="text-xs text-gray-500">Bookings</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-2xl font-bold">{stats.review_count}</p>
                                          <p className="text-xs text-gray-500">Reviews</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-2xl font-bold">₹{listing.hourly_rate}/hr</p>
                                          <p className="text-xs text-gray-500">Rate</p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex justify-end mt-4 space-x-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => navigate(`/parking/${listing.id}`)}
                                        >
                                          View
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                        >
                                          Edit
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          customStyle="primary" 
                          className="w-full"
                          onClick={() => navigate('/for-hosts')}
                        >
                          Add New Listing
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                )}
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
