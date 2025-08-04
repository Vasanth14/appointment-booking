const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const bookingSchema = mongoose.Schema(
  {
    slot: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Slot',
      required: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    reasonForVisit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
        },
        message: 'Please enter a valid contact number'
      }
    },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
bookingSchema.plugin(toJSON);
bookingSchema.plugin(paginate);

// Indexes for efficient queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ slot: 1 });
bookingSchema.index({ status: 1, createdAt: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

// Virtual for checking if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  if (!this.populated('slot')) return false;
  const now = new Date();
  const slotDate = new Date(this.slot.date);
  return slotDate > now && this.status === 'confirmed';
});

// Virtual for checking if booking is past
bookingSchema.virtual('isPast').get(function() {
  if (!this.populated('slot')) return false;
  const now = new Date();
  const slotDate = new Date(this.slot.date);
  return slotDate < now || this.status === 'completed';
});

// Pre-save middleware to validate slot availability
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Slot = mongoose.model('Slot');
      const slot = await Slot.findById(this.slot);
      
      if (!slot) {
        return next(new Error('Slot not found'));
      }
      
      if (!slot.canAcceptBooking()) {
        return next(new Error('Slot is full or inactive'));
      }
      
      // Check if user already has a booking for this slot
      const existingBooking = await mongoose.model('Booking').findOne({
        user: this.user,
        slot: this.slot,
        status: { $in: ['confirmed'] }
      });
      
      if (existingBooking) {
        return next(new Error('You already have a booking for this slot'));
      }
      
      // Increment slot booking count
      await slot.incrementBookings();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Pre-remove middleware to decrement slot booking count
bookingSchema.pre('remove', async function(next) {
  try {
    const Slot = mongoose.model('Slot');
    const slot = await Slot.findById(this.slot);
    if (slot) {
      await slot.decrementBookings();
    }
  } catch (error) {
    return next(error);
  }
  next();
});

// Static method to find upcoming bookings for a user
bookingSchema.statics.findUpcomingByUser = function(userId) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentTime = now.toTimeString().slice(0, 5); // Get current time in HH:MM format
  
  return this.find({
    user: userId,
    status: 'confirmed',
  })
  .populate('slot')
  .populate('user', 'name email')
  .then(bookings => {
    // Filter bookings where slot date is in the future, or slot is today but time is in the future
    return bookings.filter(booking => {
      if (!booking.slot) return false;
      
      const slotDate = new Date(booking.slot.date);
      const slotDateOnly = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
      
      // If slot date is in the future, it's upcoming
      if (slotDateOnly > today) {
        return true;
      }
      
      // If slot is today, check if the time is in the future
      if (slotDateOnly.getTime() === today.getTime()) {
        return booking.slot.startTime > currentTime;
      }
      
      // If slot date is in the past, it's not upcoming
      return false;
    });
  })
  .then(bookings => {
    // Sort by date and time
    return bookings.sort((a, b) => {
      const dateA = new Date(a.slot.date + 'T' + a.slot.startTime);
      const dateB = new Date(b.slot.date + 'T' + b.slot.startTime);
      return dateA - dateB;
    });
  });
};

// Static method to find past bookings for a user
bookingSchema.statics.findPastByUser = function(userId) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentTime = now.toTimeString().slice(0, 5); // Get current time in HH:MM format
  
  return this.find({
    user: userId,
    status: { $in: ['completed', 'cancelled', 'confirmed'] }, // Include confirmed bookings that might be past
  })
  .populate('slot')
  .populate('user', 'name email')
  .then(bookings => {
    // Filter bookings where slot date is in the past, or slot is today but time has passed
    return bookings.filter(booking => {
      if (!booking.slot) return false;
      
      const slotDate = new Date(booking.slot.date);
      const slotDateOnly = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
      
      // If slot date is in the past, it's past
      if (slotDateOnly < today) {
        return true;
      }
      
      // If slot is today, check if the time has passed
      if (slotDateOnly.getTime() === today.getTime()) {
        return booking.slot.startTime <= currentTime;
      }
      
      // If slot date is in the future, it's not past
      return false;
    });
  })
  .then(bookings => {
    // Sort by date and time (most recent first)
    return bookings.sort((a, b) => {
      const dateA = new Date(a.slot.date + 'T' + a.slot.startTime);
      const dateB = new Date(b.slot.date + 'T' + b.slot.startTime);
      return dateB - dateA;
    });
  });
};

// Static method to find all bookings (admin)
bookingSchema.statics.findAllBookings = function() {
  return this.find({})
  .populate('slot')
  .populate('user', 'name email')
  .sort({ createdAt: -1 });
};

// Static method to find upcoming bookings (admin)
bookingSchema.statics.findUpcoming = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentTime = now.toTimeString().slice(0, 5); // Get current time in HH:MM format
  
  return this.find({
    status: 'confirmed',
  })
  .populate('slot')
  .populate('user', 'name email')
  .then(bookings => {
    // Filter bookings where slot date is in the future, or slot is today but time is in the future
    return bookings.filter(booking => {
      if (!booking.slot) return false;
      
      const slotDate = new Date(booking.slot.date);
      const slotDateOnly = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
      
      // If slot date is in the future, it's upcoming
      if (slotDateOnly > today) {
        return true;
      }
      
      // If slot is today, check if the time is in the future
      if (slotDateOnly.getTime() === today.getTime()) {
        return booking.slot.startTime > currentTime;
      }
      
      // If slot date is in the past, it's not upcoming
      return false;
    });
  })
  .then(bookings => {
    // Sort by date and time
    return bookings.sort((a, b) => {
      const dateA = new Date(a.slot.date + 'T' + a.slot.startTime);
      const dateB = new Date(b.slot.date + 'T' + b.slot.startTime);
      return dateA - dateB;
    });
  });
};

// Static method to find past bookings (admin)
bookingSchema.statics.findPast = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentTime = now.toTimeString().slice(0, 5); // Get current time in HH:MM format
  
  return this.find({
    status: { $in: ['completed', 'cancelled', 'confirmed'] }, // Include confirmed bookings that might be past
  })
  .populate('slot')
  .populate('user', 'name email')
  .then(bookings => {
    // Filter bookings where slot date is in the past, or slot is today but time has passed
    return bookings.filter(booking => {
      if (!booking.slot) return false;
      
      const slotDate = new Date(booking.slot.date);
      const slotDateOnly = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
      
      // If slot date is in the past, it's past
      if (slotDateOnly < today) {
        return true;
      }
      
      // If slot is today, check if the time has passed
      if (slotDateOnly.getTime() === today.getTime()) {
        return booking.slot.startTime <= currentTime;
      }
      
      // If slot date is in the future, it's not past
      return false;
    });
  })
  .then(bookings => {
    // Sort by date and time (most recent first)
    return bookings.sort((a, b) => {
      const dateA = new Date(a.slot.date + 'T' + a.slot.startTime);
      const dateB = new Date(b.slot.date + 'T' + b.slot.startTime);
      return dateB - dateA;
    });
  });
};

// Method to cancel booking
bookingSchema.methods.cancel = async function(cancelledByUserId) {
  if (this.status !== 'confirmed') {
    throw new Error('Only confirmed bookings can be cancelled');
  }
  
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledByUserId;
  
  // Decrement slot booking count
  const Slot = mongoose.model('Slot');
  const slot = await Slot.findById(this.slot);
  if (slot) {
    await slot.decrementBookings();
  }
  
  return this.save();
};

// Method to complete booking
bookingSchema.methods.complete = function() {
  if (this.status !== 'confirmed') {
    throw new Error('Only confirmed bookings can be completed');
  }
  
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 