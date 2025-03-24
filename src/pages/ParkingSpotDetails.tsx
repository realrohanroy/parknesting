
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  Car,
  ShieldCheck,
  CameraIcon,
  Wifi,
  Layers,
  User,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Helper to get current auth user
const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

// Type for our listing with features
type ListingWithFeatures = {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  space_type: string;
  hourly_rate: number;
  daily_rate: number | null;
  monthly_rate: number | null;
  images: string[];
  latitude: number;
  longitude: number;
  created_at: string;
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  listing_features: {
    id: string;
    feature: string;
    value: any;
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    reviewer: {
      first_name: string;
      last_name: string;
      avatar_url: string;
    };
  }[];
};

const ParkingSpotDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(addDays(new Date(), 7));
  const [isDateFromOpen, setIsDateFromOpen] = useState(false);
  const [isDateToOpen, setIsDateToOpen] = useState(false);

  // Fetch listing details with features and host profile
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      // First check if the ID is valid
      if (!id) throw new Error('No listing ID provided');

      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profile:profiles(id, first_name, last_name, avatar_url),
          listing_features(*),
          reviews(
            id, rating, comment, created_at,
            reviewer:reviewer_id(first_name, last_name, avatar_url)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as ListingWithFeatures;
    },
  });

  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: async (booking: {
      listing_id: string;
      start_time: Date;
      end_time: Date;
      total_price: number;
    }) => {
      // First get the current user
      const user = await getCurrentUser();
      if (!user) throw new Error('You must be logged in to book');

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          listing_id: booking.listing_id,
          user_id: user.id,
          start_time: booking.start_time.toISOString(),
          end_time: booking.end_time.toISOString(),
          total_price: booking.total_price,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Booking Request Sent',
        description: 'Your booking request has been submitted successfully.',
      });
      // Redirect to dashboard
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Booking Failed',
        description: error.message || 'There was an error creating your booking.',
        variant: 'destructive',
      });
    },
  });

  // Calculate total price based on selected dates
  const calculateTotalPrice = () => {
    if (!listing || !dateFrom || !dateTo) return 0;
    
    const days = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 1) {
      return listing.hourly_rate * 24; // Full day rate
    } else if (days <= 30) {
      return (listing.daily_rate || listing.hourly_rate * 20) * days;
    } else {
      return (listing.monthly_rate || listing.daily_rate! * 25) * Math.ceil(days / 30);
    }
  };

  // Handle booking submission
  const handleBookNow = async () => {
    if (!listing || !dateFrom || !dateTo) {
      toast({
        title: 'Incomplete Information',
        description: 'Please select a valid date range for your booking.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createBooking.mutateAsync({
        listing_id: listing.id,
        start_time: dateFrom,
        end_time: dateTo,
        total_price: calculateTotalPrice(),
      });
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const totalPrice = calculateTotalPrice();
  const featureIcons: Record<string, React.ReactNode> = {
    'covered': <Car className="h-4 w-4" />,
    'underground': <Layers className="h-4 w-4" />,
    'security_camera': <CameraIcon className="h-4 w-4" />,
    'gated': <ShieldCheck className="h-4 w-4" />,
    '24_7_access': <Clock className="h-4 w-4" />,
    'electric_charging': <Wifi className="h-4 w-4" />,
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Error Loading Parking Space</CardTitle>
              <CardDescription>
                We couldn't load the details for this parking space.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">
                {error instanceof Error ? error.message : 'An unknown error occurred'}
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/search')}>
                Return to Search
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate average rating
  const avgRating = listing.reviews.length > 0
    ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Listing Title and Location */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{`${listing.address}, ${listing.city}, ${listing.state} ${listing.zipcode}`}</span>
            </div>
          </div>
          
          {/* Gallery */}
          <div className="mb-10">
            {listing.images && listing.images.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {listing.images.map((image, index) => (
                    <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3">
                      <Card className="border-0">
                        <CardContent className="p-1">
                          <img 
                            src={image} 
                            alt={`View ${index + 1} of ${listing.title}`}
                            className="rounded-lg object-cover w-full h-64" 
                          />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            ) : (
              <div className="rounded-lg bg-gray-200 w-full h-64 flex justify-center items-center">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Listing Details */}
            <div className="lg:col-span-2">
              {/* Host Info */}
              <div className="flex items-center mb-6">
                <div className="bg-gray-200 rounded-full h-12 w-12 overflow-hidden mr-3">
                  {listing.profile.avatar_url ? (
                    <img 
                      src={listing.profile.avatar_url} 
                      alt={`${listing.profile.first_name} ${listing.profile.last_name}`}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">Hosted by {listing.profile.first_name} {listing.profile.last_name}</h3>
                  {avgRating > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{avgRating.toFixed(1)} ({listing.reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">About this space</h2>
                <p className="text-gray-700">{listing.description}</p>
              </div>
              
              {/* Features */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.listing_features.map((feature) => (
                    <Badge 
                      key={feature.id} 
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {featureIcons[feature.feature.toLowerCase()] || <Layers className="h-4 w-4" />}
                      {feature.feature.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Reviews */}
              <div>
                <h2 className="text-xl font-semibold mb-3">
                  Reviews {listing.reviews.length > 0 && `(${listing.reviews.length})`}
                </h2>
                
                {listing.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {listing.reviews.map((review) => (
                      <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center mb-2">
                          <div className="bg-gray-200 rounded-full h-10 w-10 overflow-hidden mr-3">
                            {review.reviewer.avatar_url ? (
                              <img 
                                src={review.reviewer.avatar_url} 
                                alt={`${review.reviewer.first_name} ${review.reviewer.last_name}`}
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{review.reviewer.first_name} {review.reviewer.last_name}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(review.created_at), 'MMMM yyyy')}
                            </div>
                          </div>
                          <div className="ml-auto flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                            <span>{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet</p>
                )}
              </div>
            </div>
            
            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold">₹{listing.hourly_rate}</span>
                      <span className="text-gray-500 text-sm">/hour</span>
                    </div>
                    {avgRating > 0 && (
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span>{avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </CardTitle>
                  {listing.daily_rate && (
                    <CardDescription>
                      Daily: ₹{listing.daily_rate} · Monthly: ₹{listing.monthly_rate || listing.daily_rate * 25}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From</label>
                      <Popover open={isDateFromOpen} onOpenChange={setIsDateFromOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateFrom && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={dateFrom}
                            onSelect={(date) => {
                              setDateFrom(date);
                              setIsDateFromOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">To</label>
                      <Popover open={isDateToOpen} onOpenChange={setIsDateToOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateTo && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={dateTo}
                            onSelect={(date) => {
                              setDateTo(date);
                              setIsDateToOpen(false);
                            }}
                            initialFocus
                            disabled={(date) => 
                              dateFrom ? date < dateFrom : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="border-t border-b py-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Parking fee</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service fee</span>
                      <span>₹{(totalPrice * 0.10).toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{(totalPrice * 1.10).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handleBookNow}
                    disabled={createBooking.isPending}
                  >
                    {createBooking.isPending ? "Processing..." : "Book Now"}
                  </Button>
                </CardFooter>
                <div className="px-6 pb-4 text-center text-sm text-gray-500">
                  You won't be charged yet
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ParkingSpotDetails;
