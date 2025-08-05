'use client';

import AdminOnly from "@/components/AdminOnly"
import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, Edit, Trash2, Loader2, Filter, SortAsc } from "lucide-react";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  fetchSlots, 
  createSlot, 
  updateSlot, 
  deleteSlot,
  selectSlots, 
  selectSlotsLoading, 
  selectSlotsError 
} from '@/store/slices/slotSlice';
import { toast } from 'sonner';

export default function SlotsPage() {
  const dispatch = useAppDispatch();
  const slots = useAppSelector(selectSlots);
  const loading = useAppSelector(selectSlotsLoading);
  const error = useAppSelector(selectSlotsError);

  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    description: '',
  });

  // Filter and sort state
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    dispatch(fetchSlots());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : error.message || 'An error occurred');
    }
  }, [error]);

  // Helper function to determine slot status
  const getSlotStatus = (slot) => {
    const now = new Date();
    const slotDate = new Date(slot.date);
    const slotDateTime = new Date(slotDate);
    
    // Set the time from startTime
    const [hours, minutes] = slot.startTime.split(':');
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Check if slot is in the past
    if (slotDateTime < now) {
      return slot.currentBookings === 0 ? 'expired' : 'booked';
    }
    
    // Slot is in the future
    return slot.currentBookings === 0 ? 'available' : 'booked';
  };

  // Filter and sort slots
  const filteredAndSortedSlots = useMemo(() => {
    if (!Array.isArray(slots)) return [];

    let filteredSlots = [...slots];

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredSlots = filteredSlots.filter(slot => {
        const status = getSlotStatus(slot);
        if (statusFilter === 'available') {
          return status === 'available';
        } else if (statusFilter === 'booked') {
          return status === 'booked';
        } else if (statusFilter === 'expired') {
          return status === 'expired';
        }
        return true;
      });
    }

    // Apply sorting
    filteredSlots.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'time':
          comparison = a.startTime.localeCompare(b.startTime);
          break;
        case 'status':
          const statusA = getSlotStatus(a);
          const statusB = getSlotStatus(b);
          const statusOrder = { available: 0, booked: 1, expired: 2 };
          comparison = statusOrder[statusA] - statusOrder[statusB];
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filteredSlots;
  }, [slots, statusFilter, sortBy, sortOrder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Automatically calculate end time when start time changes
      if (name === 'startTime' && value) {
        const startTime = new Date(`2000-01-01T${value}`);
        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Add 30 minutes
        newData.endTime = endTime.toTimeString().slice(0, 5);
      }
      
      return newData;
    });
  };

  const validateForm = () => {
    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    // Validate that slot duration is exactly 30 minutes
    const startTime = new Date(`2000-01-01T${formData.startTime}`);
    const endTime = new Date(`2000-01-01T${formData.endTime}`);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    
    if (durationMinutes !== 30) {
      toast.error('Slot duration must be exactly 30 minutes');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingSlot) {
        await dispatch(updateSlot({ slotId: editingSlot.id, slotData: formData })).unwrap();
        toast.success('Slot updated successfully');
      } else {
        await dispatch(createSlot(formData)).unwrap();
        toast.success('Slot created successfully');
      }
      
      resetForm();
    } catch (error) {
      toast.error(typeof error === 'string' ? error : error.message || 'Failed to save slot');
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      description: slot.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (slotId) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      await dispatch(deleteSlot(slotId)).unwrap();
      toast.success('Slot deleted successfully');
      // Refresh the slots list after successful deletion
      dispatch(fetchSlots());
    } catch (error) {
      toast.error(typeof error === 'string' ? error : error.message || 'Failed to delete slot');
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      startTime: '',
      endTime: '',
      description: '',
    });
    setEditingSlot(null);
    setShowForm(false);
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

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <AdminOnly>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center slot-flex">
        <div>
          <h1 className="text-3xl font-bold">Slot Management</h1>
          <p className="text-muted-foreground">Create and manage your appointment slots</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          Add Slot
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSlot ? 'Edit Slot' : 'Create New Slot'}</CardTitle>
            <CardDescription>
              {editingSlot ? 'Update the slot details' : 'Add a new 30-minute appointment slot (one booking per slot)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Automatically set to 30 minutes after start time</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Optional description for this slot..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingSlot ? 'Update Slot' : 'Create Slot'
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

      {/* Slots List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center slot-flex">
          <h2 className="text-2xl font-semibold">Available Slots</h2>
          
          {/* Filter and Sort Controls */}
          <div className="flex gap-4 items-center">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Slots</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="px-2"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedSlots.length} of {slots.length} slots
          {statusFilter !== 'all' && ` (filtered by ${statusFilter})`}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !Array.isArray(slots) || slots.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No slots available</h3>
              <p className="text-muted-foreground">Create your first appointment slot to get started.</p>
            </CardContent>
          </Card>
        ) : filteredAndSortedSlots.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No slots match your filter</h3>
              <p className="text-muted-foreground">Try adjusting your filter criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedSlots.map((slot) => (
              <Card key={slot._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
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
                        {(() => {
                          const status = getSlotStatus(slot);
                          let badgeVariant, badgeText;
                          
                          switch (status) {
                            case 'available':
                              badgeVariant = "default";
                              badgeText = "Available";
                              break;
                            case 'booked':
                              badgeVariant = "secondary";
                              badgeText = "Booked";
                              break;
                            case 'expired':
                              badgeVariant = "destructive";
                              badgeText = "Expired";
                              break;
                            default:
                              badgeVariant = "outline";
                              badgeText = "Unknown";
                          }
                          
                          return (
                            <Badge variant={badgeVariant}>
                              {badgeText}
                            </Badge>
                          );
                        })()}
                        <Badge variant="outline">
                          {slot.currentBookings || 0}/1 booking
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(slot)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(slot.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </AdminOnly>
  );
} 