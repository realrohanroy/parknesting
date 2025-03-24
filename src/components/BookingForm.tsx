
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CalendarClock, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useBookings, BookingVehicleInfo } from '@/hooks/use-bookings';

interface BookingFormProps {
  listingId: string;
  title: string;
  hourlyRate: number;
}

export function BookingForm({ listingId, title, hourlyRate }: BookingFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createBooking, checkAvailability } = useBookings();
  
  const [startDate, setStartDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [startTime, setStartTime] = useState<string>("10:00");
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [endTime, setEndTime] = useState<string>("12:00");
  const [vehicleInfo, setVehicleInfo] = useState<BookingVehicleInfo>({
    make: '',
    model: '',
    license_plate: '',
    color: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate price when dates/times change
  useEffect(() => {
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setTotalPrice(0);
      return;
    }
    
    // Calculate hours
    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const hours = durationMs / (1000 * 60 * 60);
    
    if (hours <= 0) {
      setTotalPrice(0);
      return;
    }
    
    // Calculate price
    setTotalPrice(Number((hours * hourlyRate).toFixed(2)));
  }, [startDate, startTime, endDate, endTime, hourlyRate]);
  
  // Check availability when dates/times change
  const handleCheckAvailability = async () => {
    if (!startDate || !startTime || !endDate || !endTime) {
      toast({
        title: "Missing information",
        description: "Please select dates and times",
        variant: "destructive",
      });
      return;
    }
    
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      toast({
        title: "Invalid dates",
        description: "Please select valid dates and times",
        variant: "destructive",
      });
      return;
    }
    
    if (endDateTime <= startDateTime) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }
    
    if (startDateTime < new Date()) {
      toast({
        title: "Invalid start time",
        description: "Start time must be in the future",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const available = await checkAvailability(
        listingId,
        startDateTime,
        endDateTime
      );
      setIsAvailable(available);
      
      if (!available) {
        toast({
          title: "Not available",
          description: "This parking spot is not available for the selected time",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to check availability:", error);
      toast({
        title: "Error",
        description: "Failed to check availability",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book this parking spot",
        variant: "destructive",
      });
      navigate('/auth', { state: { from: window.location.pathname } });
      return;
    }
    
    if (!isAvailable) {
      toast({
        title: "Check availability",
        description: "Please check availability before booking",
        variant: "destructive",
      });
      return;
    }
    
    if (totalPrice <= 0) {
      toast({
        title: "Invalid booking",
        description: "Please select a valid time range",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      
      const result = await createBooking(
        listingId,
        startDateTime,
        endDateTime,
        vehicleInfo
      );
      
      if (result) {
        toast({
          title: "Booking successful",
          description: "Your booking request has been submitted",
        });
        
        // Navigate to dashboard bookings
        navigate('/dashboard?tab=bookings');
      }
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Book this spot</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Date & Time Selection */}
        <div className="space-y-3">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-parkongo-600" />
            <Label className="font-medium">When do you need parking?</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <div className="relative">
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <div className="relative">
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full"
                />
                <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <div className="relative">
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <div className="relative">
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full"
                />
                <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCheckAvailability}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-parkongo-600 border-t-transparent rounded-full"></div>
                Checking...
              </div>
            ) : (
              <div className="flex items-center">
                <CalendarClock className="h-4 w-4 mr-2" />
                Check Availability
              </div>
            )}
          </Button>
          
          {isAvailable === true && (
            <div className="text-center text-green-600 font-medium">
              ✓ Available for selected time
            </div>
          )}
          
          {isAvailable === false && (
            <div className="text-center text-red-600 font-medium">
              ✗ Not available for selected time
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Vehicle Information */}
        <div className="space-y-3">
          <div className="flex items-center">
            <Car className="h-5 w-5 mr-2 text-parkongo-600" />
            <Label className="font-medium">Vehicle Information</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="vehicle-make">Make</Label>
              <Input
                id="vehicle-make"
                placeholder="e.g. Honda"
                value={vehicleInfo.make || ''}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, make: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicle-model">Model</Label>
              <Input
                id="vehicle-model"
                placeholder="e.g. Civic"
                value={vehicleInfo.model || ''}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, model: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicle-color">Color</Label>
              <Input
                id="vehicle-color"
                placeholder="e.g. Blue"
                value={vehicleInfo.color || ''}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="license-plate">License Plate</Label>
              <Input
                id="license-plate"
                placeholder="e.g. ABC123"
                value={vehicleInfo.license_plate || ''}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, license_plate: e.target.value }))}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Pricing Summary */}
        <div className="space-y-2">
          <h3 className="font-medium">Price Details</h3>
          
          <div className="flex justify-between text-sm">
            <span>₹{hourlyRate} × hourly rate</span>
          </div>
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full bg-parkongo-600 hover:bg-parkongo-700"
          disabled={!isAvailable || isSubmitting}
          onClick={handleBooking}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Processing...
            </div>
          ) : (
            "Book Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
