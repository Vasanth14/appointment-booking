'use client';

import AdminOnly from "@/components/AdminOnly"
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Edit, Trash2, Loader2 } from "lucide-react";
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

  useEffect(() => {
    dispatch(fetchSlots());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : error.message || 'An error occurred');
    }
  }, [error]);

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
        await dispatch(updateSlot({ slotId: editingSlot._id, slotData: formData })).unwrap();
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

  return (
    <AdminOnly>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Slot Management</h1>
          <p className="text-muted-foreground">Create and manage 30-minute appointment slots (one booking per slot)</p>
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
        <h2 className="text-2xl font-semibold">Available Slots</h2>
        
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
        ) : (
          <div className="grid gap-4">
            {slots.map((slot) => (
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
                        <Badge variant={slot.isAvailable ? "default" : "secondary"}>
                          {slot.isAvailable ? 'Available' : 'Booked'}
                        </Badge>
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
                        onClick={() => handleDelete(slot._id)}
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