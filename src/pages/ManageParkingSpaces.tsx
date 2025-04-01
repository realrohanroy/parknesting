import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, MapPin, DollarSign, Calendar, Pencil, Trash2 } from 'lucide-react';

const parkingSpaceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipcode: z.string().min(5, "Zip code is required"),
  space_type: z.string().min(1, "Space type is required"),
  hourly_rate: z.coerce.number().min(0, "Hourly rate must be a positive number"),
  daily_rate: z.coerce.number().min(0, "Daily rate must be a positive number").optional(),
  monthly_rate: z.coerce.number().min(0, "Monthly rate must be a positive number").optional(),
  is_available: z.boolean().default(true),
});

type ParkingSpaceFormValues = z.infer<typeof parkingSpaceSchema>;

const spaceTypes = [
  { value: 'driveway', label: 'Driveway' },
  { value: 'garage', label: 'Garage' },
  { value: 'lot', label: 'Parking Lot' },
  { value: 'street', label: 'Street Parking' },
  { value: 'underground', label: 'Underground Garage' },
];

const ManageParkingSpaces = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentListing, setCurrentListing] = useState<any>(null);

  const form = useForm<ParkingSpaceFormValues>({
    resolver: zodResolver(parkingSpaceSchema),
    defaultValues: {
      title: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      space_type: '',
      hourly_rate: 0,
      daily_rate: undefined,
      monthly_rate: undefined,
      is_available: true,
    }
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your parking spaces",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!isDialogOpen) {
      form.reset();
      setCurrentListing(null);
    }
  }, [isDialogOpen, form]);

  useEffect(() => {
    if (currentListing) {
      form.reset({
        title: currentListing.title,
        description: currentListing.description || '',
        address: currentListing.address,
        city: currentListing.city,
        state: currentListing.state,
        zipcode: currentListing.zipcode,
        space_type: currentListing.space_type,
        hourly_rate: currentListing.hourly_rate,
        daily_rate: currentListing.daily_rate,
        monthly_rate: currentListing.monthly_rate,
        is_available: currentListing.is_available,
      });
    }
  }, [currentListing, form]);

  const { data: hostProfile, isLoading: loadingHostProfile } = useQuery({
    queryKey: ['hostProfile', user?.id],
    queryFn: async () => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();
      
      if (profileError) throw profileError;
      if (profile?.role !== 'host') {
        throw new Error('You must be an approved host to manage parking spaces');
      }
      
      const { data: host, error: hostError } = await supabase
        .from('hosts')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (hostError) throw hostError;
      return host;
    },
    enabled: !!user?.id,
  });

  const { data: parkingSpaces, isLoading } = useQuery({
    queryKey: ['parkingSpaces', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('profile_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createListing = useMutation({
    mutationFn: async (values: ParkingSpaceFormValues) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const listingData = {
        ...values,
        profile_id: user.id,
      };

      const { data, error } = await supabase
        .from('listings')
        .insert([listingData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parkingSpaces'] });
      toast({
        title: "Success",
        description: "Your parking space has been listed successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
        variant: "destructive",
      });
    },
  });

  const updateListing = useMutation({
    mutationFn: async (values: ParkingSpaceFormValues) => {
      const { data, error } = await supabase
        .from('listings')
        .update(values)
        .eq('id', currentListing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parkingSpaces'] });
      toast({
        title: "Success",
        description: "Your parking space has been updated successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update listing",
        variant: "destructive",
      });
    },
  });

  const deleteListing = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parkingSpaces'] });
      toast({
        title: "Success",
        description: "Your parking space has been deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ParkingSpaceFormValues) => {
    if (currentListing) {
      updateListing.mutate(values);
    } else {
      createListing.mutate(values);
    }
  };

  const handleEditListing = (listing: any) => {
    setCurrentListing(listing);
    setIsDialogOpen(true);
  };

  const handleDeleteListing = (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      deleteListing.mutate(id);
    }
  };

  if (loadingHostProfile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-full">
            <p>Loading your host profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Manage Parking Spaces</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add New Space
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{currentListing ? 'Edit' : 'Add'} Parking Space</DialogTitle>
                  <DialogDescription>
                    Fill out the details below to {currentListing ? 'update your' : 'create a new'} parking space listing.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Convenient Downtown Parking" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your parking space in detail" 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="space_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Space Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {spaceTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="is_available"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Available for booking</FormLabel>
                              <FormDescription>
                                Uncheck to hide this listing
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Location Information</h3>
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="zipcode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Zip Code</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Pricing</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="hourly_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hourly Rate ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" min="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="daily_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Rate ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" min="0" 
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="monthly_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Rate ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" min="0" 
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createListing.isPending || updateListing.isPending}>
                        {(createListing.isPending || updateListing.isPending) 
                          ? 'Saving...' 
                          : currentListing ? 'Update Listing' : 'Create Listing'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-64 animate-pulse">
                  <CardContent className="p-0 h-full flex flex-col justify-between">
                    <div className="bg-gray-200 dark:bg-gray-800 h-32"></div>
                    <div className="p-4">
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : parkingSpaces && parkingSpaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parkingSpaces.map((space: any) => (
                <Card key={space.id}>
                  <CardHeader>
                    <CardTitle>{space.title}</CardTitle>
                    <CardDescription>{space.space_type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{space.address}, {space.city}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          ${space.hourly_rate}/hr
                          {space.daily_rate && ` · $${space.daily_rate}/day`}
                          {space.monthly_rate && ` · $${space.monthly_rate}/mo`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {space.description || "No description provided"}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleEditListing(space)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteListing(space.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No Parking Spaces Yet</h3>
              <p className="text-gray-500 mb-6">You don't have any parking spaces listed yet.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Parking Space
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManageParkingSpaces;
