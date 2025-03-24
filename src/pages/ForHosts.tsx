
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { Warehouse, CheckCircle, DollarSign, Calendar, Shield, Upload, CameraIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// Define the form schema
const ListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipcode: z.string().min(5, "Zipcode is required"),
  description: z.string().optional(),
  space_type: z.string().min(1, "Space type is required"),
  hourly_rate: z.coerce.number().min(1, "Hourly rate is required"),
  features: z.object({
    security_camera: z.boolean().default(false),
    covered: z.boolean().default(false),
    electric_charging: z.boolean().default(false),
    overnight: z.boolean().default(false),
    accessible: z.boolean().default(false),
  }).default({}),
});

const ForHosts: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  
  // Fetch user session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
  
  // Fetch profile to check if user is a host
  useQuery({
    queryKey: ['profileRole'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      setIsHost(data.role === 'host');
      return data;
    },
    enabled: !!session?.user?.id,
  });
  
  // Check if user has a pending host application
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
        setApplicationStatus(data.status);
      }
      return data;
    },
    enabled: !!session?.user?.id && !isHost,
  });
  
  // Initialize form
  const form = useForm<z.infer<typeof ListingSchema>>({
    resolver: zodResolver(ListingSchema),
    defaultValues: {
      title: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      description: '',
      space_type: '',
      hourly_rate: 0,
      features: {
        security_camera: false,
        covered: false,
        electric_charging: false,
        overnight: false,
        accessible: false,
      },
    },
  });
  
  // Apply to become a host mutation
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
      setApplicationStatus('pending');
      toast({
        title: "Application Submitted",
        description: "Your host application has been submitted for review.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit application: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Create listing mutation
  const createListing = useMutation({
    mutationFn: async (values: z.infer<typeof ListingSchema>) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      // First insert the listing
      const { data: listing, error } = await supabase
        .from('listings')
        .insert({
          profile_id: session.user.id,
          title: values.title,
          address: values.address,
          city: values.city,
          state: values.state,
          zipcode: values.zipcode,
          description: values.description,
          space_type: values.space_type,
          hourly_rate: values.hourly_rate,
          // This will trigger the function to set location from lat/long
          latitude: 0, // These would be set from geocoding in a real app
          longitude: 0,
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      // Then add features
      const featurePromises = Object.entries(values.features).map(([feature, value]) => {
        if (value) {
          return supabase
            .from('listing_features')
            .insert({
              listing_id: listing.id,
              feature,
              value: JSON.stringify(value),
            });
        }
        return Promise.resolve();
      });
      
      await Promise.all(featurePromises);
      
      // Handle image upload if present
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const filePath = `listings/${listing.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, coverImage);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: publicURL } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);
          
        // Update the listing with the image URL
        const { error: updateError } = await supabase
          .from('listings')
          .update({
            images: [publicURL.publicUrl],
          })
          .eq('id', listing.id);
          
        if (updateError) throw updateError;
      }
      
      return listing;
    },
    onSuccess: () => {
      toast({
        title: "Space Listed Successfully!",
        description: "Your parking space has been listed on Parkongo. You'll be notified when someone books it.",
      });
      form.reset();
      setCoverImage(null);
      setShowForm(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create listing: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleApplyForHost = () => {
    if (!session) {
      toast({
        title: "Please Log In",
        description: "You need to be logged in to become a host.",
      });
      navigate('/auth');
      return;
    }
    
    applyForHost.mutate();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };
  
  const onSubmit = (values: z.infer<typeof ListingSchema>) => {
    if (!isHost) {
      toast({
        title: "Not a Host",
        description: "You need to be approved as a host before listing a space.",
        variant: "destructive",
      });
      return;
    }
    
    createListing.mutate(values);
  };
  
  const benefits = [
    {
      icon: <DollarSign className="h-6 w-6 text-parkongo-600" />,
      title: "Earn Extra Income",
      description: "Turn your unused parking space into a source of passive income. Set your own rates and availability."
    },
    {
      icon: <Calendar className="h-6 w-6 text-parkongo-600" />,
      title: "Flexible Scheduling",
      description: "Choose when your space is available - rent it out full-time or only during specific hours."
    },
    {
      icon: <Shield className="h-6 w-6 text-parkongo-600" />,
      title: "Protected & Secure",
      description: "Our platform includes insurance protection and secure payment processing for peace of mind."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-parkongo-50 to-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 animate-fade-in-up">
                  Turn Your Parking Space Into Profit
                </h1>
                <p className="text-xl text-gray-700 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  Join thousands of hosts who are earning passive income by renting out their unused parking spaces on Parkongo.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  {!session ? (
                    <Button
                      variant="default"
                      size="lg"
                      customStyle="primary"
                      leftIcon={<Warehouse className="h-5 w-5" />}
                      onClick={() => navigate('/auth')}
                    >
                      Sign in to get started
                    </Button>
                  ) : isHost ? (
                    <Button
                      variant="default"
                      size="lg"
                      customStyle="primary"
                      leftIcon={<Warehouse className="h-5 w-5" />}
                      onClick={() => setShowForm(!showForm)}
                    >
                      {showForm ? "Hide Form" : "List Your Space Now"}
                    </Button>
                  ) : applicationStatus ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                      <span>Your host application is {applicationStatus}</span>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="lg"
                      customStyle="primary"
                      leftIcon={<Warehouse className="h-5 w-5" />}
                      onClick={handleApplyForHost}
                      isLoading={applyForHost.isPending}
                    >
                      Apply to Become a Host
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white p-6 animate-float">
                <div className="bg-parkongo-50 p-4 rounded-xl mb-6">
                  <h3 className="text-xl font-semibold text-parkongo-700 mb-2">Potential Monthly Earnings</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-parkongo-100">
                      <span className="text-gray-700">Urban Center</span>
                      <span className="font-semibold">₹5,000 - ₹8,000</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-parkongo-100">
                      <span className="text-gray-700">Residential Area</span>
                      <span className="font-semibold">₹3,000 - ₹5,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Business District</span>
                      <span className="font-semibold">₹6,000 - ₹12,000</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Actual earnings may vary based on location, availability, and demand
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Listing Form Section - Only shown when showForm is true and user is a host */}
        {isHost && showForm && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 md:px-6">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <h2 className="text-2xl font-bold mb-6 text-center">List Your Parking Space</h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Space Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold border-b pb-2">Space Information</h3>
                          
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="E.g. Downtown Covered Parking" {...field} />
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
                                    placeholder="Describe your parking space, access instructions, and any special features." 
                                    rows={4}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
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
                                    <SelectItem value="garage">Garage</SelectItem>
                                    <SelectItem value="driveway">Driveway</SelectItem>
                                    <SelectItem value="carport">Carport</SelectItem>
                                    <SelectItem value="outdoor">Outdoor Space</SelectItem>
                                    <SelectItem value="underground">Underground</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="hourly_rate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hourly Rate (₹)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="100" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Address Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold border-b pb-2">Address Information</h3>
                          
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main St" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Mumbai" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Maharashtra" {...field} />
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
                                  <FormLabel>ZIP Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="400001" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Features</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="features.security_camera"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-y-0">
                                <FormLabel>Security Camera</FormLabel>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="features.covered"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-y-0">
                                <FormLabel>Covered Parking</FormLabel>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="features.electric_charging"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-y-0">
                                <FormLabel>EV Charging</FormLabel>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="features.overnight"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-y-0">
                                <FormLabel>Overnight Parking</FormLabel>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="features.accessible"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-y-0">
                                <FormLabel>Accessible Parking</FormLabel>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      {/* Photos */}
                      <div className="space-y-2">
                        <Label htmlFor="coverImage">Upload Photos</Label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition">
                          <input
                            id="coverImage"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <label htmlFor="coverImage" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                            <CameraIcon className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-600">
                              {coverImage ? coverImage.name : "Click to upload photos of your space"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Clear photos increase booking chances by 80%
                            </p>
                          </label>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button
                          variant="default"
                          customStyle="primary"
                          size="lg"
                          isLoading={createListing.isPending}
                          type="submit"
                          fullWidth
                        >
                          Submit Listing
                        </Button>
                        <p className="text-xs text-center text-gray-500 mt-2">
                          By submitting, you agree to our Terms of Service and Privacy Policy
                        </p>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Why Host on Parkongo?</h2>
              <p className="text-xl text-gray-600">
                Join our community of hosts and start earning from your unused parking space
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="h-12 w-12 bg-parkongo-100 rounded-full flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">How Hosting Works</h2>
              <p className="text-xl text-gray-600">
                Three simple steps to start earning from your parking space
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: "1",
                    title: "Apply to Host",
                    description: "Submit your application and get approved to become a host on our platform."
                  },
                  {
                    step: "2",
                    title: "List Your Space",
                    description: "Add details, photos, and set your price and availability."
                  },
                  {
                    step: "3",
                    title: "Earn Money",
                    description: "Get paid securely for each booking."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-parkongo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-parkongo-600 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Earning?</h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of hosts who are already earning passive income with their parking spaces.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-4">
                {!session ? (
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-white text-parkongo-600 hover:bg-gray-100"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In to Get Started
                  </Button>
                ) : isHost ? (
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-white text-parkongo-600 hover:bg-gray-100"
                    onClick={() => setShowForm(true)}
                  >
                    List Your Space Now
                  </Button>
                ) : applicationStatus ? (
                  <div className="px-6 py-3 bg-white/10 rounded-lg text-white">
                    Your application is {applicationStatus}
                  </div>
                ) : (
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-white text-parkongo-600 hover:bg-gray-100"
                    onClick={handleApplyForHost}
                    isLoading={applyForHost.isPending}
                  >
                    Apply to Become a Host
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForHosts;
