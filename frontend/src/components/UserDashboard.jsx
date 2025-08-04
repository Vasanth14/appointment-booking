"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Users, CheckCircle, Plus, Eye, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import {
  fetchUpcomingBookings,
  fetchPastBookings,
  cancelBooking,
  selectUpcomingBookings,
  selectPastBookings,
  selectBookingsLoading,
} from "@/store/slices/bookingSlice";

import {
  fetchAvailableSlots,
  selectAvailableSlots,
  selectSlotsLoading,
} from "@/store/slices/slotSlice";

export default function UserDashboard() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const upcomingBookings = useSelector(selectUpcomingBookings);
  const pastBookings = useSelector(selectPastBookings);
  const availableSlots = useSelector(selectAvailableSlots);
  const bookingsLoading = useSelector(selectBookingsLoading);
  const slotsLoading = useSelector(selectSlotsLoading);

  useEffect(() => {
    dispatch(fetchUpcomingBookings());
    dispatch(fetchPastBookings());
    dispatch(fetchAvailableSlots());
  }, [dispatch]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await dispatch(cancelBooking(bookingId)).unwrap();
      toast.success("Booking cancelled successfully");
      dispatch(fetchUpcomingBookings());
    } catch (error) {
      toast.error(typeof error === 'string' ? error : error.message || "Failed to cancel booking");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { variant: "default", text: "Confirmed" },
      cancelled: { variant: "destructive", text: "Cancelled" },
      completed: { variant: "secondary", text: "Completed" },
    };
    
    const config = statusConfig[status] || { variant: "outline", text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const analytics = [
    {
      title: "Upcoming Appointments",
      value: upcomingBookings.length,
      icon: Calendar,
      description: "Your scheduled appointments",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Past Appointments",
      value: pastBookings.length,
      icon: CheckCircle,
      description: "Completed appointments",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Available Slots",
      value: availableSlots.length,
      icon: Clock,
      description: "Slots you can book",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Bookings",
      value: upcomingBookings.length + pastBookings.length,
      icon: Users,
      description: "All your appointments",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analytics.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <div className={`h-8 w-8 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Quick Actions
            <Link href="/dashboard/book-appointment">
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Book New Appointment
              </Button>
            </Link>
          </CardTitle>
          <CardDescription>
            Manage your appointments and book new ones
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
          <CardDescription>
            View and manage your upcoming and past appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-4">
            <Button
              variant={activeTab === "upcoming" ? "default" : "outline"}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming ({upcomingBookings.length})
            </Button>
            <Button
              variant={activeTab === "past" ? "default" : "outline"}
              onClick={() => setActiveTab("past")}
            >
              Past ({pastBookings.length})
            </Button>
          </div>

          {bookingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading appointments...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(activeTab === "upcoming" ? upcomingBookings : pastBookings).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {activeTab === "upcoming" 
                        ? "No upcoming appointments. Book your first appointment!" 
                        : "No past appointments yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  (activeTab === "upcoming" ? upcomingBookings : pastBookings).map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{formatDate(booking.slot?.date)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(booking.slot?.startTime)} - {formatTime(booking.slot?.endTime)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{booking.slot?.title || "Appointment"}</div>
                          <div className="text-sm text-muted-foreground">
                            Duration: {booking.slot?.duration || 30} min
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {booking.reasonForVisit}
                        </div>
                      </TableCell>
                      <TableCell>{booking.contactNumber}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // View booking details
                              toast.info("Viewing booking details...");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {activeTab === "upcoming" && booking.status === "confirmed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBooking(booking._id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Available Slots Preview */}
      {availableSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Available Slots
              <Link href="/dashboard/book-appointment">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardTitle>
            <CardDescription>
              Recent available slots you can book
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {availableSlots.slice(0, 6).map((slot) => (
                <div
                  key={slot._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{formatDate(slot.date)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {slot.currentBookings}/{slot.maxBookings} booked
                    </div>
                  </div>
                  <Link href={`/dashboard/book-appointment?slotId=${slot._id}`}>
                    <Button size="sm">Book</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 