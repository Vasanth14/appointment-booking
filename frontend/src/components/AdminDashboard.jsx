'use client';

import { useState, useEffect } from 'react';
import AdminOnly from "@/components/AdminOnly"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Loader2, Plus } from "lucide-react"
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  fetchAdminUpcomingBookings,
  fetchAdminPastBookings,
  selectUpcomingBookings,
  selectPastBookings,
  selectBookingsLoading,
  selectBookingsError 
} from '@/store/slices/bookingSlice';
import { Button } from "@/components/ui/button";
import { AppointmentsDataTable } from '@/components/appointments-data-table';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const upcomingBookings = useAppSelector(selectUpcomingBookings);
  const pastBookings = useAppSelector(selectPastBookings);
  const loading = useAppSelector(selectBookingsLoading);
  const error = useAppSelector(selectBookingsError);

  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    dispatch(fetchAdminUpcomingBookings());
    dispatch(fetchAdminPastBookings());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : error.message || 'Failed to load bookings');
    }
  }, [error]);

  const handleBookingDeleted = () => {
    // Refresh the data after a booking is deleted
    dispatch(fetchAdminUpcomingBookings());
    dispatch(fetchAdminPastBookings());
  };



  return (
    <AdminOnly>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">All Bookings</h1>
            <p className="text-muted-foreground">View and manage all appointment bookings</p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/slots')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create your slot
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{Array.isArray(upcomingBookings) ? upcomingBookings.length : 0}</div>
              <p className="text-sm text-muted-foreground">Upcoming Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{Array.isArray(pastBookings) ? pastBookings.length : 0}</div>
              <p className="text-sm text-muted-foreground">Past Bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Upcoming ({Array.isArray(upcomingBookings) ? upcomingBookings.length : 0})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({Array.isArray(pastBookings) ? pastBookings.length : 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !Array.isArray(upcomingBookings) || upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming bookings</h3>
                  <p className="text-muted-foreground">No upcoming appointments found.</p>
                </CardContent>
              </Card>
            ) : (
              <AppointmentsDataTable 
                data={upcomingBookings} 
                loading={false} 
                onBookingDeleted={handleBookingDeleted}
              />
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !Array.isArray(pastBookings) || pastBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No past bookings</h3>
                  <p className="text-muted-foreground">No past appointments found.</p>
                </CardContent>
              </Card>
            ) : (
              <AppointmentsDataTable 
                data={pastBookings} 
                loading={false} 
                onBookingDeleted={handleBookingDeleted}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnly>
  );
} 