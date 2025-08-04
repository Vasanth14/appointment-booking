'use client';

import { useState, useEffect } from 'react';
import AdminOnly from "@/components/AdminOnly"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Loader2 } from "lucide-react"
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  fetchAllBookings,
  selectBookings,
  selectBookingsLoading,
  selectBookingsError 
} from '@/store/slices/bookingSlice';
import { AppointmentsDataTable } from '@/components/appointments-data-table';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectBookings);
  const loading = useAppSelector(selectBookingsLoading);
  const error = useAppSelector(selectBookingsError);

  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    dispatch(fetchAllBookings());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : error.message || 'Failed to load bookings');
    }
  }, [error]);

  const filterBookings = (status) => {
    if (!Array.isArray(bookings)) return [];
    if (status === 'all') return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  const confirmedBookings = filterBookings('confirmed');
  const cancelledBookings = filterBookings('cancelled');
  const completedBookings = filterBookings('completed');

  return (
    <AdminOnly>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">All Bookings</h1>
          <p className="text-muted-foreground">View and manage all appointment bookings</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{Array.isArray(bookings) ? bookings.length : 0}</div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{confirmedBookings.length}</div>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{completedBookings.length}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{cancelledBookings.length}</div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({Array.isArray(bookings) ? bookings.length : 0})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({confirmedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !Array.isArray(bookings) || bookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                  <p className="text-muted-foreground">No appointments have been booked yet.</p>
                </CardContent>
              </Card>
            ) : (
              <AppointmentsDataTable data={bookings} loading={loading} />
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : confirmedBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No confirmed bookings</h3>
                  <p className="text-muted-foreground">No confirmed appointments found.</p>
                </CardContent>
              </Card>
            ) : (
              <AppointmentsDataTable data={confirmedBookings} loading={false} />
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : completedBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No completed bookings</h3>
                  <p className="text-muted-foreground">No completed appointments found.</p>
                </CardContent>
              </Card>
            ) : (
              <AppointmentsDataTable data={completedBookings} loading={false} />
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : cancelledBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No cancelled bookings</h3>
                  <p className="text-muted-foreground">No cancelled appointments found.</p>
                </CardContent>
              </Card>
            ) : (
              <AppointmentsDataTable data={cancelledBookings} loading={false} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnly>
  );
} 