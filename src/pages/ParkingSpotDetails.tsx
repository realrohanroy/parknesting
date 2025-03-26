import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingForm } from '@/components/BookingForm';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  Shield, 
  Star, 
  Heart, 
  Share2, 
  ChevronLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ParkingSpotDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch parking spot details
  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:profile_id (
            first_name,
            last_name,
            avatar_url,
            created_at
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Fetch listing features separately
      const { data: features, error: featuresError } = await supabase
        .from('listing_features')
        .select('feature, value')
        .eq('listing_id', id);
      
      if (featuresError) throw featuresError;
      
      return {
        ...data,
        listing_features: features || []
      };
    },
    enabled: !!id,
  });

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      if (!id) return [];
      
      // First get the reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('listing_id', id)
        .order('created_at', { ascending: false });
      
      if (reviewsError) throw reviewsError;
      
      // Then fetch profile data for each reviewer
      const reviewsWithProfiles = await Promise.all(
        reviewsData.map(async (review) => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('id', review.reviewer_id)
            .single();
          
          return {
            ...review,
            profiles: profile || { first_name: null, last_name: null, avatar_url: null }
          };
        })
      );
      
      return reviewsWithProfiles;
    },
    enabled: !!id,
  });

  // Check if listing is in user's favorites
  useQuery({
    queryKey: ['favorite', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('listing_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      setIsFavorite(!!data);
      return data;
    },
    enabled: !!id && !!user?.id,
  });

  // Toggle favorite mutation
  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!id || !user?.id) throw new Error('Not authenticated');
      
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('listing_id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return false;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            listing_id: id,
            user_id: user.id,
          });
        
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (isFav) => {
      setIsFavorite(isFav);
      toast({
        title: isFav ? "Added to favorites" : "Removed from favorites",
        description: isFav 
          ? "This parking spot has been added to your favorites" 
          : "This parking spot has been removed from your favorites",
      });
      queryClient.invalidateQueries({ queryKey: ['favorite', id, user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update favorites: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    toggleFavorite.mutate();
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title || 'Parking Spot',
        text: `Check out this parking spot: ${listing?.title}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Parking spot link copied to clipboard",
      });
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  // Format features
  const formatFeatures = () => {
    if (!listing?.listing_features || !Array.isArray(listing.listing_features)) return [];
    
    const featureLabels: Record<string, string> = {
      security_camera: "Security Camera",
      covered: "Covered Parking",
      electric_charging: "EV Charging",
      overnight: "Overnight Parking",
      accessible: "Accessible Parking",
    };
    
    return listing.listing_features
      .filter(f => f.value === 'true' || f.value === true)
      .map(f => featureLabels[f.feature] || f.feature);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parkongo-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Parking Spot Not Found</h1>
          <p className="text-gray-600 mb-6">The parking spot you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/search')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse/check images array
  const listingImages = Array.isArray(listing?.images) ? 
    listing.images.map(img => typeof img === 'string' ? img : String(img)) : 
    [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Back button */}
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {/* Listing Title and Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{listing.title}</h1>
              <div className="flex items-center mt-2 text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{listing.address}, {listing.city}, {listing.state}</span>
              </div>
            </div>
            
            <div className="flex items-center mt-4 md:mt-0 space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={isFavorite ? "text-red-500" : ""}
                onClick={handleFavoriteToggle}
              >
                <Heart className={`mr-1 h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                {isFavorite ? "Saved" : "Save"}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="mr-1 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Listing Details */}
            <div className="lg:col-span-8 xl:col-span-9">
              {/* Images */}
              <div className="mb-8 rounded-xl overflow-hidden">
                {listingImages.length > 0 ? (
                  <div className="aspect-video bg-gray-100">
                    <img 
                      src={listingImages[0]} 
                      alt={listing.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <Car className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Tabs */}
              <Tabs defaultValue="details" className="mb-8">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                {/* Details Tab */}
                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>About this parking space</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="text-gray-600">
                          {listing.description || "No description provided."}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">Space Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Space Type</p>
                            <p className="font-medium">
                              {listing.space_type?.charAt(0).toUpperCase() + listing.space_type?.slice(1) || "Standard"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Hourly Rate</p>
                            <p className="font-medium">₹{listing.hourly_rate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Size</p>
                            <p className="font-medium">
                              Standard
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">Location</h3>
                        <div className="aspect-video bg-gray-100 rounded-md">
                          {/* Map would go here in a real implementation */}
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-gray-400 mr-2" />
                            <span className="text-gray-500">Map view not available</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {listing.address}, {listing.city}, {listing.state} {listing.zipcode}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Features Tab */}
                <TabsContent value="features">
                  <Card>
                    <CardHeader>
                      <CardTitle>Parking Space Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formatFeatures().length > 0 ? (
                          formatFeatures().map((feature, index) => (
                            <div key={index} className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>{feature}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No specific features listed for this parking space.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Reviews Tab */}
                <TabsContent value="reviews">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Reviews</CardTitle>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="font-bold">{averageRating.toFixed(1)}</span>
                          <span className="text-gray-500 ml-1">({reviews.length} reviews)</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {reviewsLoading ? (
                        <div className="text-center py-4">Loading reviews...</div>
                      ) : reviews.length > 0 ? (
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <div key={review.id} className="border-b pb-4 last:border-0">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={review.profiles?.avatar_url || ''} />
                                    <AvatarFallback>
                                      {review.profiles?.first_name?.[0] || ''}{review.profiles?.last_name?.[0] || ''}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {review.profiles?.first_name} {review.profiles?.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(review.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Star className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
                          <p className="text-gray-500">This parking space hasn't received any reviews yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              {/* Host Information */}
              <Card>
                <CardHeader>
                  <CardTitle>About the Host</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={listing.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {listing.profiles?.first_name?.[0] || ''}{listing.profiles?.last_name?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {listing.profiles?.first_name} {listing.profiles?.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Host since {new Date(listing.profiles?.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Booking Form */}
            <div className="lg:col-span-4 xl:col-span-3">
              <BookingForm 
                listingId={listing?.id || ''} 
                title={listing?.title || 'Parking Spot'} 
                hourlyRate={listing?.hourly_rate || 0}
              />
              
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Shield className="h-5 w-5 text-parkongo-600 mr-2" />
                    <h3 className="font-medium">Secure Booking</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your booking is protected by our secure payment system and cancellation policy.
                  </p>
                </CardContent>
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
