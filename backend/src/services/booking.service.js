const models = require('../models');
const Booking = models.Booking;
const Slot = models.Slot;
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Create a booking
 * @param {Object} bookingBody
 * @returns {Promise<Booking>}
 */
const createBooking = async (bookingBody) => {
  return Booking.create(bookingBody);
};

/**
 * Get booking by id
 * @param {ObjectId} id
 * @returns {Promise<Booking>}
 */
const getBookingById = async (id) => {
  return Booking.findById(id);
};

/**
 * Get booking by id with populated fields
 * @param {ObjectId} id
 * @returns {Promise<Booking>}
 */
const getBookingByIdPopulated = async (id) => {
  return Booking.findById(id)
    .populate('slot')
    .populate('user', 'name email')
    .populate('cancelledBy', 'name email');
};

/**
 * Get all bookings
 * @param {Object} filter - Mongoose filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryBookings = async (filter, options) => {
  const bookings = await Booking.paginate(filter, options);
  return bookings;
};

/**
 * Get upcoming bookings for a user
 * @param {ObjectId} userId
 * @returns {Promise<Booking[]>}
 */
const getUpcomingBookingsByUser = async (userId) => {
  return Booking.findUpcomingByUser(userId);
};

/**
 * Get past bookings for a user
 * @param {ObjectId} userId
 * @returns {Promise<Booking[]>}
 */
const getPastBookingsByUser = async (userId) => {
  return Booking.findPastByUser(userId);
};

/**
 * Get all bookings (admin)
 * @returns {Promise<Booking[]>}
 */
const getAllBookings = async () => {
  return Booking.findAllBookings();
};

/**
 * Update booking by id
 * @param {ObjectId} bookingId
 * @param {Object} updateBody
 * @returns {Promise<Booking>}
 */
const updateBookingById = async (bookingId, updateBody) => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  
  Object.assign(booking, updateBody);
  await booking.save();
  return booking;
};

/**
 * Cancel booking
 * @param {ObjectId} bookingId
 * @param {ObjectId} cancelledByUserId
 * @returns {Promise<Booking>}
 */
const cancelBooking = async (bookingId, cancelledByUserId) => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  
  return booking.cancel(cancelledByUserId);
};

/**
 * Complete booking
 * @param {ObjectId} bookingId
 * @returns {Promise<Booking>}
 */
const completeBooking = async (bookingId) => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  
  return booking.complete();
};

/**
 * Delete booking by id
 * @param {ObjectId} bookingId
 * @returns {Promise<Booking>}
 */
const deleteBookingById = async (bookingId) => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  
  await booking.remove();
  return booking;
};

/**
 * Get bookings by status
 * @param {string} status
 * @returns {Promise<Booking[]>}
 */
const getBookingsByStatus = async (status) => {
  return Booking.find({ status })
    .populate('slot')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Get bookings by slot
 * @param {ObjectId} slotId
 * @returns {Promise<Booking[]>}
 */
const getBookingsBySlot = async (slotId) => {
  return Booking.find({ slot: slotId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Get booking statistics
 * @returns {Promise<Object>}
 */
const getBookingStats = async () => {
  const totalBookings = await Booking.countDocuments();
  const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
  const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
  const completedBookings = await Booking.countDocuments({ status: 'completed' });
  
  // Get today's bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayBookings = await Booking.countDocuments({
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  });
  
  return {
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    completedBookings,
    todayBookings,
  };
};

/**
 * Check if user can book a slot
 * @param {ObjectId} userId
 * @param {ObjectId} slotId
 * @returns {Promise<boolean>}
 */
const canUserBookSlot = async (userId, slotId) => {
  // Check if slot exists and is available
  const slot = await Slot.findById(slotId);
  if (!slot || !slot.canAcceptBooking()) {
    return false;
  }
  
  // Check if user already has a booking for this slot
  const existingBooking = await Booking.findOne({
    user: userId,
    slot: slotId,
    status: { $in: ['confirmed'] }
  });
  
  return !existingBooking;
};

module.exports = {
  createBooking,
  getBookingById,
  getBookingByIdPopulated,
  queryBookings,
  getUpcomingBookingsByUser,
  getPastBookingsByUser,
  getAllBookings,
  updateBookingById,
  cancelBooking,
  completeBooking,
  deleteBookingById,
  getBookingsByStatus,
  getBookingsBySlot,
  getBookingStats,
  canUserBookSlot,
}; 