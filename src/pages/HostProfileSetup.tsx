
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, Controller } from 'react-hook-form';

type HostProfile = {
  space_type: string;
  space_size: string;
  monthly_rate: number;
  security_deposit: number;
  bio: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  amenities: string[];
  availability_days: string[];
  restrictions: string[];
  service_areas: string[];
}

const availableDays = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const amenityOptions = [
  { id: 'covered', label: 'Covered Parking' },
  { id: 'security', label: 'Security Camera' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'gated', label: 'Gated Access' },
  { id: 'ev_charging', label: 'EV Charging' },
  { id: '24_hour_access', label: '24-Hour Access' },
];

const spaceTypes = [
  { value: 'driveway', label: 'Driveway' },
  { value: 'garage', label: 'Garage' },
  { value: 'lot', label: 'Parking Lot' },
  { value: 'street', label: 'Street Parking' },
  { value: 'underground', label: 'Underground Garage' },
];

const spaceSize = [
  { value: 'compact', label: 'Compact Car' },
  { value: 'standard', label: 'Standard Car' },
  { value: 'large', label: 'Large Vehicle/SUV' },
  { value: 'oversized', label: 'Oversized/RV/Truck' },
];

const HostProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<HostProfile>({
    defaultValues: {
      space_type: '',
      space_size: '',
      monthly_rate: 0,
      security_deposit: 0,
      bio: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      amenities: [],
      availability_days: [],
      restrictions: [],
      service_areas: [],
    }
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to set up your host profile",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    const fetchHostProfile = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is a host
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        if (profile && profile.role !== 'host') {
          toast({
            title: "Access Denied",
            description: "Only approved hosts can access this page",
            variant: "destructive",
          });
          navigate('/become-host');
          return;
        }
        
        // Fetch host data
        const { data: hostData, error: hostError } = await supabase
          .from('hosts')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (hostError && hostError.code !== 'PGRST116') {
          throw hostError;
        }
        
        if (hostData) {
          setHostProfile(hostData);
          
          // Set form values - Fixed the type issue here
          Object.entries(hostData).forEach(([key, value]) => {
            if (value !== null && key in hostData) {
              setValue(key as keyof HostProfile, value as any);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching host profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your host profile information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostProfile();
  }, [user, navigate, setValue]);

  const geocodeAddress = async (formData: HostProfile, hostId: string) => {
    const { address, city, state, zipcode } = formData;
    try {
      const response = await fetch(`${window.location.origin}/functions/v1/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession()}`
        },
        body: JSON.stringify({
          address,
          city,
          state,
          zipcode,
          host_id: hostId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to geocode address');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  const onSubmit = async (data: HostProfile) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // First update the host profile
      const { data: updatedHost, error } = await supabase
        .from('hosts')
        .update({
          space_type: data.space_type,
          space_size: data.space_size,
          monthly_rate: data.monthly_rate,
          security_deposit: data.security_deposit,
          bio: data.bio,
          address: data.address,
          city: data.city,
          state: data.state,
          zipcode: data.zipcode,
          amenities: data.amenities,
          availability_days: data.availability_days,
          restrictions: data.restrictions,
          service_areas: data.service_areas.map(area => area.trim()),
        })
        .eq('user_id', user.id)
        .select('id')
        .single();
      
      if (error) throw error;
      
      // Now geocode the address
      if (updatedHost && updatedHost.id) {
        try {
          await geocodeAddress(data, updatedHost.id);
          toast({
            title: "Success",
            description: "Your host profile and location have been updated successfully",
          });
        } catch (geocodeError) {
          console.error("Error geocoding address:", geocodeError);
          toast({
            title: "Partial Success",
            description: "Your profile was updated but we couldn't update your location. Please ensure your address is valid.",
            variant: "destructive",
          });
        }
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Error updating host profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your host profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Host Profile Setup</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>About Your Space</CardTitle>
                <CardDescription>
                  Tell us about the parking space you're offering
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="space_type">Space Type</Label>
                    <Controller
                      name="space_type"
                      control={control}
                      rules={{ required: "Space type is required" }}
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type of space" />
                          </SelectTrigger>
                          <SelectContent>
                            {spaceTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.space_type && (
                      <p className="text-sm text-red-500">{errors.space_type.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="space_size">Space Size</Label>
                    <Controller
                      name="space_size"
                      control={control}
                      rules={{ required: "Space size is required" }}
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size of space" />
                          </SelectTrigger>
                          <SelectContent>
                            {spaceSize.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.space_size && (
                      <p className="text-sm text-red-500">{errors.space_size.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly_rate">Monthly Rate ($)</Label>
                    <Input 
                      id="monthly_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('monthly_rate', { 
                        required: "Monthly rate is required",
                        min: { value: 0, message: "Rate must be positive" }
                      })}
                    />
                    {errors.monthly_rate && (
                      <p className="text-sm text-red-500">{errors.monthly_rate.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="security_deposit">Security Deposit ($)</Label>
                    <Input 
                      id="security_deposit"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('security_deposit', { 
                        min: { value: 0, message: "Deposit must be positive" }
                      })}
                    />
                    {errors.security_deposit && (
                      <p className="text-sm text-red-500">{errors.security_deposit.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Description</Label>
                  <Textarea 
                    id="bio"
                    placeholder="Describe your parking space"
                    className="h-32"
                    {...register('bio', { 
                      required: "Description is required",
                      maxLength: { value: 500, message: "Description must be less than 500 characters" }
                    })}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500">{errors.bio.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Enter the address of your parking space
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input 
                    id="address"
                    {...register('address', { required: "Address is required" })}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city"
                      {...register('city', { required: "City is required" })}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500">{errors.city.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state"
                      {...register('state', { required: "State is required" })}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500">{errors.state.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipcode">Zip Code</Label>
                    <Input 
                      id="zipcode"
                      {...register('zipcode', { required: "Zip code is required" })}
                    />
                    {errors.zipcode && (
                      <p className="text-sm text-red-500">{errors.zipcode.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service_areas">Service Areas (comma separated)</Label>
                  <Textarea 
                    id="service_areas"
                    placeholder="e.g. Downtown, West Side, Airport"
                    {...register('service_areas')}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Amenities & Availability</CardTitle>
                <CardDescription>
                  Select the amenities you offer and when your space is available
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="block mb-2">Amenities</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {amenityOptions.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Controller
                          name="amenities"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id={`amenity-${amenity.id}`}
                              checked={field.value?.includes(amenity.id)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), amenity.id]
                                  : (field.value || []).filter((value) => value !== amenity.id);
                                field.onChange(updatedValue);
                              }}
                            />
                          )}
                        />
                        <Label htmlFor={`amenity-${amenity.id}`} className="cursor-pointer">
                          {amenity.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="block mb-2">Availability</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {availableDays.map((day) => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Controller
                          name="availability_days"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id={`day-${day.id}`}
                              checked={field.value?.includes(day.id)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), day.id]
                                  : (field.value || []).filter((value) => value !== day.id);
                                field.onChange(updatedValue);
                              }}
                            />
                          )}
                        />
                        <Label htmlFor={`day-${day.id}`} className="cursor-pointer">
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="restrictions">Restrictions (e.g., no large vehicles, no overnight parking)</Label>
                  <Controller
                    name="restrictions"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id="restrictions"
                        value={field.value?.join('\n') || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value.split('\n').filter(item => item.trim()));
                        }}
                        placeholder="Enter each restriction on a new line"
                        className="h-24"
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Host Profile'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HostProfileSetup;
