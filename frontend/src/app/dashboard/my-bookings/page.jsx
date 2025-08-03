'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Phone, FileText, Loader2, XCircle } from "lucide-react";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  fetchUpcomingBookings,
  fetchPastBookings,
  cancelBooking,
  selectUpcomingBookings,
  selectPastBookings,
  selectBookingsLoading,
  selectBookingsError 
} from '@/store/slices/bookingSlice';
import { toast } from 'sonner';

export default function MyBookingsPage() {
  const dispatch = useAppDispatch();
  const upcomingBookings = useAppSelector(selectUpcomingBookings);
  const pastBookings = useAppSelector(selectPastBookings);
  const loading = useAppSelector(selectBookingsLoading);
  const error = useAppSelector(selectBookingsError);

  console.log('My Bookings - upcomingBookings:', upcomingBookings, 'pastBookings:', pastBookings, 'loading:', loading, 'error:', error);

  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    console.log('=== FETCHING MY BOOKINGS ===');
    dispatch(fetchUpcomingBookings()).then((result) => {
      console.log('fetchUpcomingBookings result:', result);
    }).catch((error) => {
      console.error('fetchUpcomingBookings error:', error);
    });
    dispatch(fetchPastBookings()).then((result) => {
      console.log('fetchPastBookings result:', result);
    }).catch((error) => {
      console.error('fetchPastBookings error:', error);
    });
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : error.message || 'Failed to cancel booking');
    }
  }, [error]);

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await dispatch(cancelBooking(bookingId)).unwrap();
      toast.success('Appointment cancelled successfully');
      
      // Refresh bookings
      dispatch(fetchUpcomingBookings());
      dispatch(fetchPastBookings());
    } catch (error) {
      toast.error(typeof error === 'string' ? error : error.message || 'Failed to cancel appointment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

     const BookingCard = ({ booking, showCancelButton = false }) => (
     <Card key={booking.id}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatDate(booking.slot?.date)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatTime(booking.slot?.startTime)} - {formatTime(booking.slot?.endTime)}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Reason:</span>
                                 <span className="text-sm">{booking.reasonForVisit}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Contact:</span>
                <span className="text-sm">{booking.contactNumber}</span>
              </div>
              
                             {booking.additionalNotes && (
                 <div className="flex items-start gap-2">
                   <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                   <div>
                     <span className="text-sm font-medium">Notes:</span>
                     <p className="text-sm text-muted-foreground">{booking.additionalNotes}</p>
                   </div>
                 </div>
               )}
            </div>
            
            <div className="flex gap-2">
              {getStatusBadge(booking.status)}
                                           <Badge variant="outline">
                Booking ID: {booking.id}
              </Badge>
            </div>
          </div>
          
          {showCancelButton && booking.status === 'confirmed' && (
            <Button
              size="sm"
              variant="outline"
                             onClick={() => handleCancelBooking(booking.id)}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your appointments</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground">You don't have any upcoming appointments.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
                          {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showCancelButton={true} />
            ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : pastBookings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No past appointments</h3>
                <p className="text-muted-foreground">You don't have any past appointments.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
                          {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showCancelButton={false} />
            ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 