const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const slotSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Start time must be in HH:MM format'
      }
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'End time must be in HH:MM format'
      }
    },
    maxBookings: {
      type: Number,
      required: true,
      min: 1,
      max: 1,
      default: 1,
    },
    currentBookings: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
slotSchema.plugin(toJSON);
slotSchema.plugin(paginate);

// Virtual for checking if slot is available
slotSchema.virtual('isAvailable').get(function() {
  if (!this.isActive || this.currentBookings >= this.maxBookings) {
    return false;
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentTime = now.toTimeString().slice(0, 5);
  
  // Add 15-minute buffer to prevent booking slots that are too close
  const bufferTime = new Date(now.getTime() + 15 * 60 * 1000);
  const bufferTimeString = bufferTime.toTimeString().slice(0, 5);
  
  // Check if slot date is in the future
  if (this.date > today) {
    return true;
  }
  
  // Check if slot is today but time is in the future (with buffer)
  if (this.date.getTime() === today.getTime() && this.startTime > bufferTimeString) {
    return true;
  }
  
  return false;
});

// Index for efficient queries
slotSchema.index({ date: 1, startTime: 1 });
slotSchema.index({ isActive: 1, date: 1 });
slotSchema.index({ createdBy: 1 });

// Pre-save middleware to ensure end time is after start time and slot is exactly 30 minutes
slotSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const start = new Date(`2000-01-01T${this.startTime}`);
    const end = new Date(`2000-01-01T${this.endTime}`);
    
    if (end <= start) {
      return next(new Error('End time must be after start time'));
    }
    
    // Check if slot duration is exactly 30 minutes
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    
    if (durationMinutes !== 30) {
      return next(new Error('Slot duration must be exactly 30 minutes'));
    }
  }
  next();
});

// Static method to find available slots
slotSchema.statics.findAvailable = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentTime = now.toTimeString().slice(0, 5); // Get current time in HH:MM format
  
  // Add 15-minute buffer to prevent booking slots that are too close
  const bufferTime = new Date(now.getTime() + 15 * 60 * 1000);
  const bufferTimeString = bufferTime.toTimeString().slice(0, 5);
  
  return this.find({
    isActive: true,
    currentBookings: { $lt: 1 }, // Ensure only slots with 0 bookings are returned
    $or: [
      // Future dates
      { date: { $gt: today } },
      // Today's date with future time (with buffer for booking time)
      {
        date: today,
        startTime: { $gt: bufferTimeString }
      }
    ]
  }).sort({ date: 1, startTime: 1 });
};

// Method to check if slot can accept more bookings
slotSchema.methods.canAcceptBooking = function() {
  // Check basic availability
  if (!this.isActive || this.currentBookings >= this.maxBookings) {
    return false;
  }
  
  // Check if slot is in the past or too close to current time
  const now = new Date();
  const slotDateTime = new Date(this.date);
  
  // Set the time from startTime
  const [hours, minutes] = this.startTime.split(':');
  slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  // Add 15-minute buffer to prevent booking slots that are too close
  const bufferTime = new Date(now.getTime() + 15 * 60 * 1000);
  
  // Slot is in the past or too close
  if (slotDateTime <= bufferTime) {
    return false;
  }
  
  return true;
};

// Method to increment booking count
slotSchema.methods.incrementBookings = function() {
  if (this.canAcceptBooking()) {
    this.currentBookings += 1;
    return this.save();
  }
  throw new Error('Slot is full or inactive');
};

// Method to decrement booking count
slotSchema.methods.decrementBookings = function() {
  if (this.currentBookings > 0) {
    this.currentBookings -= 1;
    return this.save();
  }
  throw new Error('No bookings to decrement');
};

// Method to refresh booking count from actual bookings
slotSchema.methods.refreshBookingCount = async function() {
  const mongoose = require('mongoose');
  const Booking = mongoose.model('Booking');
  
  const confirmedBookings = await Booking.countDocuments({
    slot: this._id,
    status: 'confirmed'
  });
  
  this.currentBookings = confirmedBookings;
  return this.save();
};

// Method to check if a user has already booked this slot
slotSchema.methods.isBookedByUser = async function(userId) {
  const mongoose = require('mongoose');
  const Booking = mongoose.model('Booking');
  
  const existingBooking = await Booking.findOne({
    slot: this._id,
    user: userId,
    status: 'confirmed'
  });
  
  return !!existingBooking;
};

// Static method to find available slots with user booking status
slotSchema.statics.findAvailableWithUserStatus = async function(userId) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentTime = now.toTimeString().slice(0, 5);
  
  // Add 15-minute buffer to prevent booking slots that are too close
  const bufferTime = new Date(now.getTime() + 15 * 60 * 1000);
  const bufferTimeString = bufferTime.toTimeString().slice(0, 5);
  
  const slots = await this.find({
    isActive: true,
    currentBookings: { $lt: 1 }, // Ensure only slots with 0 bookings are returned
    $or: [
      // Future dates
      { date: { $gt: today } },
      // Today's date with future time (with buffer for booking time)
      {
        date: today,
        startTime: { $gt: bufferTimeString }
      }
    ]
  }).sort({ date: 1, startTime: 1 });
  
  // Add user booking status to each slot
  const slotsWithUserStatus = await Promise.all(
    slots.map(async (slot) => {
      const isBookedByUser = await slot.isBookedByUser(userId);
      return {
        ...slot.toObject(),
        isBookedByUser
      };
    })
  );
  
  return slotsWithUserStatus;
};

// Static method to refresh all slot booking counts
slotSchema.statics.refreshAllBookingCounts = async function() {
  const mongoose = require('mongoose');
  const Booking = mongoose.model('Booking');
  
  const slots = await this.find({});
  
  for (const slot of slots) {
    const confirmedBookings = await Booking.countDocuments({
      slot: slot._id,
      status: 'confirmed'
    });
    
    slot.currentBookings = confirmedBookings;
    await slot.save();
  }
  
  return slots.length;
};

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot; 