
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Car,
  Calendar,
  Clock,
  Check,
  X,
  Loader2,
  Flag,
  MapPin,
  AlertCircle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useBookings, Booking } from '@/hooks/use-bookings';
import { useToast } from '@/hooks/use-toast';

type BookingAction = 'confirm' | 'reject' | 'cancel' | 'complete';

interface BookingsListProps {
  type: 'user' | 'host';
}

export function BookingsList({ type }: BookingsListProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    userBookings,
    hostBookings,
    isLoading,
    fetchUserBookings,
    fetchHostBookings,
    updateBookingStatus,
  } = useBookings();

  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    booking: Booking | null;
    action: BookingAction | null;
  }>({
    open: false,
    booking: null,
    action: null,
  });

  // Fetch bookings on component mount
  useEffect(() => {
    if (user) {
      if (type === 'user') {
        fetchUserBookings();
      } else {
        fetchHostBookings();
      }
    }
  }, [user, type, fetchUserBookings, fetchHostBookings]);

  const bookings = type === 'user' ? userBookings : hostBookings;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAction = async () => {
    if (!actionDialog.booking || !actionDialog.action) return;

    let status: 'confirmed' | 'rejected' | 'cancelled' | 'completed';
    switch (actionDialog.action) {
      case 'confirm':
        status = 'confirmed';
        break;
      case 'reject':
        status = 'rejected';
        break;
      case 'cancel':
        status = 'cancelled';
        break;
      case 'complete':
        status = 'completed';
        break;
      default:
        return;
    }

    const success = await updateBookingStatus(actionDialog.booking.id, status);
    
    if (success) {
      setActionDialog({ open: false, booking: null, action: null });
      
      // Refresh the bookings list
      if (type === 'user') {
        fetchUserBookings();
      } else {
        fetchHostBookings();
      }
    }
  };

  const openActionDialog = (booking: Booking, action: BookingAction) => {
    setActionDialog({
      open: true,
      booking,
      action,
    });
  };

  const getActionTitle = () => {
    if (!actionDialog.action) return '';
    
    switch (actionDialog.action) {
      case 'confirm':
        return 'Confirm Booking';
      case 'reject':
        return 'Reject Booking';
      case 'cancel':
        return 'Cancel Booking';
      case 'complete':
        return 'Complete Booking';
      default:
        return '';
    }
  };

  const getActionDescription = () => {
    if (!actionDialog.booking || !actionDialog.action) return '';
    
    const title = actionDialog.booking.listings?.title || 'this parking spot';
    
    switch (actionDialog.action) {
      case 'confirm':
        return `Are you sure you want to confirm this booking for ${title}?`;
      case 'reject':
        return `Are you sure you want to reject this booking for ${title}?`;
      case 'cancel':
        return `Are you sure you want to cancel this booking for ${title}?`;
      case 'complete':
        return `Are you sure you want to mark this booking for ${title} as completed?`;
      default:
        return '';
    }
  };

  const getAvailableActions = (booking: Booking) => {
    const { status } = booking;
    
    if (type === 'host') {
      if (status === 'pending') {
        return (
          <>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => openActionDialog(booking, 'confirm')}
            >
              <Check className="mr-1 h-4 w-4" /> Confirm
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => openActionDialog(booking, 'reject')}
            >
              <X className="mr-1 h-4 w-4" /> Reject
            </Button>
          </>
        );
      } else if (status === 'confirmed') {
        return (
          <>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => openActionDialog(booking, 'complete')}
            >
              <Flag className="mr-1 h-4 w-4" /> Complete
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => openActionDialog(booking, 'cancel')}
            >
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
          </>
        );
      }
    } else if (type === 'user') {
      if (status === 'pending' || status === 'confirmed') {
        return (
          <Button 
            size="sm" 
            variant="outline" 
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => openActionDialog(booking, 'cancel')}
          >
            <X className="mr-1 h-4 w-4" /> Cancel
          </Button>
        );
      }
    }
    
    return null;
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-60 text-center p-6">
        <AlertCircle className="h-10 w-10 text-gray-400 mb-2" />
        <h3 className="text-xl font-medium mb-2">Authentication Required</h3>
        <p className="text-gray-500 mb-4">Please sign in to view your bookings</p>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-60">
        <Loader2 className="h-8 w-8 animate-spin text-parkongo-600" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-60 text-center p-6">
        <Calendar className="h-10 w-10 text-gray-400 mb-2" />
        <h3 className="text-xl font-medium mb-2">No Bookings Found</h3>
        <p className="text-gray-500 mb-4">
          {type === 'user' 
            ? "You haven't made any bookings yet." 
            : "You don't have any bookings for your listings yet."}
        </p>
        {type === 'user' && (
          <Button onClick={() => navigate('/search')}>Find Parking</Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[calc(100vh-13rem)]">
        <div className="space-y-4 pr-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {booking.listings?.title || 'Parking Space'}
                    </CardTitle>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {booking.listings?.address}, {booking.listings?.city}
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </CardHeader>
              
              <CardContent className="pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {format(new Date(booking.start_time), "MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {format(new Date(booking.start_time), "h:mm a")} - {format(new Date(booking.end_time), "h:mm a")}
                      </span>
                    </div>
                  </div>
                  
                  {booking.vehicle_info && (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-medium">
                        <Car className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Vehicle Details</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.vehicle_info.make} {booking.vehicle_info.model}{' '}
                        {booking.vehicle_info.color && `(${booking.vehicle_info.color})`}
                        {booking.vehicle_info.license_plate && (
                          <span className="ml-1">• {booking.vehicle_info.license_plate}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-500">Total:</span>{' '}
                    <span className="font-semibold">₹{booking.total_price}</span>
                  </div>
                  
                  {type === 'host' && booking.profiles && (
                    <div className="text-sm text-right">
                      <span className="text-gray-500">Booked by:</span>{' '}
                      <span className="font-medium">
                        {booking.profiles.first_name} {booking.profiles.last_name}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 flex justify-end gap-2">
                {getAvailableActions(booking)}
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog(prev => ({ ...prev, open: false }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>
              {getActionDescription()}
            </DialogDescription>
          </DialogHeader>
          
          {actionDialog.booking && (
            <div className="py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Date:</span>
                <span>
                  {format(new Date(actionDialog.booking.start_time), "MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Time:</span>
                <span>
                  {format(new Date(actionDialog.booking.start_time), "h:mm a")} - {format(new Date(actionDialog.booking.end_time), "h:mm a")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold">₹{actionDialog.booking.total_price}</span>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, booking: null, action: null })}
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog.action === 'reject' || actionDialog.action === 'cancel' ? "destructive" : "default"}
              onClick={handleAction}
            >
              {actionDialog.action === 'confirm' && 'Confirm'}
              {actionDialog.action === 'reject' && 'Reject'}
              {actionDialog.action === 'cancel' && 'Cancel Booking'}
              {actionDialog.action === 'complete' && 'Mark as Completed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
