'use client';

import { useEffect } from 'react';
import UserOnly from "@/components/UserOnly";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Loader2, Plus } from "lucide-react";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  fetchAvailableSlots, 
  selectAvailableSlots, 
  selectSlotsLoading, 
  selectSlotsError 
} from '@/store/slices/slotSlice';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AvailableSlotsPage() {
  const dispatch = useAppDispatch();
  const slots = useAppSelector(selectAvailableSlots);
  const slotsLoading = useAppSelector(selectSlotsLoading);
  const slotsError = useAppSelector(selectSlotsError);

  console.log('Available Slots Page - slots:', slots, 'loading:', slotsLoading, 'error:', slotsError);

  useEffect(() => {
    console.log('=== FETCHING AVAILABLE SLOTS FOR AVAILABLE SLOTS PAGE ===');
    dispatch(fetchAvailableSlots()).then((result) => {
      console.log('fetchAvailableSlots result:', result);
    }).catch((error) => {
      console.error('fetchAvailableSlots error:', error);
    });
  }, [dispatch]);

  useEffect(() => {
    if (slotsError) {
      toast.error(slotsError);
    }
  }, [slotsError]);

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

  return (
    <UserOnly>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
                         <div>
          <h1 className="text-3xl font-bold">Available Slots</h1>
          <p className="text-muted-foreground">View available 30-minute appointment slots and book your appointment</p>
        </div>
        <Link href="/dashboard/book-appointment">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Available Slots */}
      <div className="space-y-4">
        {slotsLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading available slots...</span>
            </div>
          </div>
        ) : slots.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                             <h3 className="text-xl font-medium mb-2">No available slots</h3>
               <p className="text-muted-foreground mb-4">
                 There are currently no available appointment slots. Please check back later.
               </p>
                             <Button variant="outline" onClick={() => dispatch(fetchAvailableSlots())}>
                 Refresh
               </Button>
            </CardContent>
          </Card>
        ) : (
                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {slots.map((slot) => (
               <Card key={slot.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{slot.title || "Appointment Slot"}</CardTitle>
                    {slot.isBookedByUser ? (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        You have booked this
                      </Badge>
                    ) : (
                      <Badge variant={slot.isAvailable ? "default" : "secondary"}>
                        {slot.isAvailable ? 'Available' : 'Full'}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {slot.description || "General appointment slot"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(slot.date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Duration: {slot.duration || 30} minutes
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {slot.currentBookings || 0}/{slot.maxBookings} booked
                    </div>
                    {slot.isBookedByUser ? (
                      <Button size="sm" variant="outline" disabled>
                        Already Booked
                      </Button>
                    ) : slot.isAvailable ? (
                      <Link href={`/dashboard/book-appointment?slotId=${slot.id}`}>
                        <Button size="sm">Book Now</Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        Full
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your appointments and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Link href="/dashboard/my-bookings">
              <Button variant="outline">View My Bookings</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </UserOnly>
  );
} 