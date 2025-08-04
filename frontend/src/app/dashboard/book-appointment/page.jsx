'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import UserOnly from "@/components/UserOnly";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  fetchAvailableSlots, 
  selectAvailableSlots, 
  selectSlotsLoading, 
  selectSlotsError 
} from '@/store/slices/slotSlice';
import { 
  createBooking,
  selectBookingsLoading,
  selectBookingsError 
} from '@/store/slices/bookingSlice';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema
const bookingFormSchema = z.object({
  reason: z.string()
    .min(1, 'Reason for visit is required')
    .min(3, 'Reason must be at least 3 characters')
    .max(200, 'Reason must be less than 200 characters'),
  contactNumber: z.string()
    .min(1, 'Contact number is required')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .refine((val) => {
      // Remove all non-digit characters except + for validation
      const cleaned = val.replace(/[\s\-\(\)\.]/g, '');
      return cleaned.length >= 10 && cleaned.length <= 15;
    }, 'Phone number must be between 10 and 15 digits'),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

export default function BookAppointmentPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const availableSlots = useAppSelector(selectAvailableSlots);
  const slotsLoading = useAppSelector(selectSlotsLoading);
  const slotsError = useAppSelector(selectSlotsError);
  const bookingLoading = useAppSelector(selectBookingsLoading);
  const bookingError = useAppSelector(selectBookingsError);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  console.log('Available slots:', availableSlots, 'Loading:', slotsLoading, 'Error:', slotsError);
  console.log('Available slots length:', availableSlots?.length);
  console.log('First available slot:', availableSlots?.[0]);
  console.log('showBookingForm:', showBookingForm, 'selectedSlot:', selectedSlot);
  const [formData, setFormData] = useState({
    reason: '',
    contactNumber: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    console.log('=== FETCHING AVAILABLE SLOTS ===');
    dispatch(fetchAvailableSlots()).then((result) => {
      console.log('fetchAvailableSlots result:', result);
      console.log('fetchAvailableSlots result type:', typeof result);
      console.log('fetchAvailableSlots result payload:', result.payload);
    }).catch((error) => {
      console.error('fetchAvailableSlots error:', error);
    });
  }, [dispatch]);

  // Handle slotId from URL query parameter
  useEffect(() => {
    const slotId = searchParams.get('slotId');
    console.log('URL slotId:', slotId, 'availableSlots length:', availableSlots.length);
    if (slotId && availableSlots.length > 0) {
      const slot = availableSlots.find(s => s.id === slotId);
      console.log('Found slot from URL:', slot);
      if (slot) {
        setSelectedSlot(slot);
        setShowBookingForm(true);
      }
    }
  }, [searchParams, availableSlots]);

  useEffect(() => {
    if (slotsError) {
      toast.error(slotsError);
    }
  }, [slotsError]);

  useEffect(() => {
    if (bookingError) {
      toast.error(bookingError);
    }
  }, [bookingError]);

  const handleSlotSelect = (slot) => {
    console.log('=== SLOT SELECTION ===');
    console.log('Selected slot:', slot);
    console.log('Selected slot id:', slot.id);
    console.log('Selected slot keys:', Object.keys(slot));
    
    // Don't allow selection if user has already booked this slot
    if (slot.isBookedByUser) {
      toast.info('You have already booked this slot');
      return;
    }
    
    // Check if slot is in the past or too close
    const now = new Date();
    const slotDateTime = new Date(slot.date);
    const [hours, minutes] = slot.startTime.split(':');
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Add 15-minute buffer to prevent booking slots that are too close
    const bufferTime = new Date(now.getTime() + 15 * 60 * 1000);
    
    if (slotDateTime <= now) {
      toast.error('Cannot book slots in the past');
      return;
    }
    
    if (slotDateTime <= bufferTime) {
      toast.error('Cannot book slots that are less than 15 minutes away');
      return;
    }
    
    setSelectedSlot(slot);
    setShowBookingForm(true);
    console.log('Booking form should now be visible');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation for phone number and reason
    if (name === 'contactNumber' || name === 'reason') {
      validateField(name, value);
    }
  };

  const validateField = (fieldName, value) => {
    // Create a partial schema for the specific field
    const partialSchema = z.object({
      [fieldName]: bookingFormSchema.shape[fieldName]
    });
    
    try {
      partialSchema.parse({ [fieldName]: value });
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    } catch (error) {
      if (error instanceof z.ZodError && error.errors && error.errors.length > 0) {
        const fieldError = error.errors.find(err => err.path[0] === fieldName);
        if (fieldError) {
          setFormErrors(prev => ({
            ...prev,
            [fieldName]: fieldError.message
          }));
        }
      }
    }
  };

  const validateForm = () => {
    setIsValidating(true);
    
    try {
      bookingFormSchema.parse(formData);
      setFormErrors({});
      setIsValidating(false);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError && error.errors && error.errors.length > 0) {
        const errors = {};
        error.errors.forEach((err) => {
          if (err.path && err.path.length > 0) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
        
        // Show first error in toast
        const firstError = error.errors[0];
        if (firstError && firstError.message) {
          toast.error(firstError.message);
        }
      } else {
        // Fallback error message
        toast.error('Please check your form inputs');
      }
      setIsValidating(false);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted - selectedSlot:', selectedSlot);
    console.log('Form submitted - selectedSlot.id:', selectedSlot?.id);
    
    if (!validateForm()) return;

    if (!selectedSlot || !selectedSlot.id) {
      toast.error('Please select a slot first');
      return;
    }

    // Double-check that the selected slot is not in the past or too close
    if (isSlotActuallyPast(selectedSlot)) {
      toast.error('Cannot book slots in the past');
      return;
    }
    
    if (isSlotInPast(selectedSlot)) {
      toast.error('Cannot book slots that are less than 15 minutes away');
      return;
    }

    try {
      const bookingData = {
        slot: selectedSlot.id,
        reasonForVisit: formData.reason,
        contactNumber: formData.contactNumber,
        additionalNotes: formData.notes,
      };

      console.log('Booking data:', bookingData);

      await dispatch(createBooking(bookingData)).unwrap();
      toast.success('Appointment booked successfully!');
      
      // Reset form and refresh slots
      resetForm();
      dispatch(fetchAvailableSlots());
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(typeof error === 'string' ? error : error.message || 'Failed to book appointment');
    }
  };

  const resetForm = () => {
    setFormData({
      reason: '',
      contactNumber: '',
      notes: '',
    });
    setFormErrors({});
    setIsValidating(false);
    setSelectedSlot(null);
    setShowBookingForm(false);
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

  const isSlotInPast = (slot) => {
    const now = new Date();
    const slotDateTime = new Date(slot.date);
    const [hours, minutes] = slot.startTime.split(':');
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Add 15-minute buffer to prevent booking slots that are too close
    const bufferTime = new Date(now.getTime() + 15 * 60 * 1000);
    
    return slotDateTime <= bufferTime;
  };

  const isSlotActuallyPast = (slot) => {
    const now = new Date();
    const slotDateTime = new Date(slot.date);
    const [hours, minutes] = slot.startTime.split(':');
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    return slotDateTime <= now;
  };

  return (
    <UserOnly>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Book Appointment</h1>
          <p className="text-muted-foreground">Select an available 30-minute slot and book your appointment</p>
        </div>

      {/* Available Slots */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Available Slots</h2>
        
        {slotsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : availableSlots.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No available slots</h3>
              <p className="text-muted-foreground">Check back later for new appointment slots.</p>
            </CardContent>
          </Card>
                 ) : (
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {console.log('Rendering available slots:', availableSlots)}
                          {availableSlots.map((slot) => {
               const isPast = isSlotInPast(slot);
               const isActuallyPast = isSlotActuallyPast(slot);
               return (
               <Card 
                 key={slot.id} 
                 className={`transition-all ${
                   slot.isBookedByUser || isPast
                     ? 'opacity-75 cursor-not-allowed' 
                     : 'cursor-pointer hover:shadow-md'
                 } ${
                   selectedSlot?.id === slot.id ? 'ring-2 ring-primary' : ''
                 }`}
                 onClick={() => handleSlotSelect(slot)}
               >
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(slot.date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </div>
                    
                    {slot.description && (
                      <p className="text-sm text-muted-foreground">{slot.description}</p>
                    )}
                    
                    <div className="flex gap-2">
                      {slot.isBookedByUser ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          You have booked this
                        </Badge>
                                             ) : isActuallyPast ? (
                         <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                           Past
                         </Badge>
                       ) : isPast ? (
                         <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                           Too Soon
                         </Badge>
                      ) : (
                        <Badge variant="default">
                          Available
                        </Badge>
                      )}
                                             <Badge variant="outline">
                         {slot.currentBookings || 0}/1 booked
                       </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
             );
           })}
          </div>
        )}
      </div>

      {/* Booking Form */}
      {showBookingForm && selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Book Appointment</CardTitle>
            <CardDescription>
              Fill in your details to confirm your appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Selected Slot Info */}
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Selected Slot:</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(selectedSlot.date)}</span>
                <span>•</span>
                <Clock className="h-4 w-4" />
                <span>{formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Reason for Visit *
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Please describe the reason for your appointment..."
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows={3}
                  className={formErrors.reason ? 'border-red-500 focus:border-red-500' : ''}
                />
                <div className="flex justify-between items-center">
                  {formErrors.reason && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.reason}
                    </div>
                  )}
                  <span className={`text-xs ${formData.reason.length > 180 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {formData.reason.length}/200
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactNumber">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Contact Number *
                </Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  placeholder="Enter your phone number (e.g., +1234567890)"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  className={formErrors.contactNumber ? 'border-red-500 focus:border-red-500' : ''}
                />
                {formErrors.contactNumber ? (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.contactNumber}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    We'll use this to contact you about your appointment
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">
                  <User className="h-4 w-4 inline mr-2" />
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional information you'd like to share..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className={formErrors.notes ? 'border-red-500 focus:border-red-500' : ''}
                />
                <div className="flex justify-between items-center">
                  {formErrors.notes ? (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.notes}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Optional: Any special requirements or additional information
                    </p>
                  )}
                  <span className={`text-xs ${formData.notes.length > 450 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {formData.notes.length}/500
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={bookingLoading}>
                  {bookingLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      </div>
    </UserOnly>
  );
} 