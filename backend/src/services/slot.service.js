const models = require('../models');
const Slot = models.Slot;
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Create a slot
 * @param {Object} slotBody
 * @returns {Promise<Slot>}
 */
const createSlot = async (slotBody) => {
  // Validate that slot is at least 15 minutes in the future
  const { date, startTime } = slotBody;
  const now = new Date();
  const slotDateTime = new Date(date);
  
  // Set the time from startTime
  const [hours, minutes] = startTime.split(':');
  slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  // Allow slots that are at least 15 minutes in the future
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
  
  if (slotDateTime <= fifteenMinutesFromNow) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slot must be at least 15 minutes in the future');
  }
  
  // Ensure maxBookings is always 1 for single-member slots
  const slotData = {
    ...slotBody,
    maxBookings: 1
  };
  
  return Slot.create(slotData);
};

/**
 * Get slot by id
 * @param {ObjectId} id
 * @returns {Promise<Slot>}
 */
const getSlotById = async (id) => {
  return Slot.findById(id);
};

/**
 * Get slot by id with populated fields
 * @param {ObjectId} id
 * @returns {Promise<Slot>}
 */
const getSlotByIdPopulated = async (id) => {
  return Slot.findById(id).populate('createdBy', 'name email');
};

/**
 * Get all slots
 * @param {Object} filter - Mongoose filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySlots = async (filter, options) => {
  const slots = await Slot.paginate(filter, options);
  return slots;
};

/**
 * Get available slots
 * @returns {Promise<Slot[]>}
 */
const getAvailableSlots = async () => {
  return Slot.findAvailable();
};

/**
 * Get available slots with user booking status
 * @param {ObjectId} userId
 * @returns {Promise<Slot[]>}
 */
const getAvailableSlotsWithUserStatus = async (userId) => {
  return Slot.findAvailableWithUserStatus(userId);
};

/**
 * Update slot by id
 * @param {ObjectId} slotId
 * @param {Object} updateBody
 * @returns {Promise<Slot>}
 */
const updateSlotById = async (slotId, updateBody) => {
  const slot = await getSlotById(slotId);
  if (!slot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slot not found');
  }
  
  // Ensure maxBookings is always 1 for single-member slots
  if (updateBody.maxBookings && updateBody.maxBookings !== 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Max bookings must be 1 for single-member slots');
  }
  
  // Ensure maxBookings is always 1
  const updateData = {
    ...updateBody,
    maxBookings: 1
  };
  
  // Validate date and time if both are being updated
  if (updateData.date && updateData.startTime) {
    const now = new Date();
    const slotDateTime = new Date(updateData.date);
    
    // Set the time from startTime
    const [hours, minutes] = updateData.startTime.split(':');
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Allow slots that are at least 15 minutes in the future
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
    
    if (slotDateTime <= fifteenMinutesFromNow) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Slot must be at least 15 minutes in the future');
    }
  }
  
  Object.assign(slot, updateData);
  await slot.save();
  return slot;
};

/**
 * Delete slot by id
 * @param {ObjectId} slotId
 * @returns {Promise<Slot>}
 */
const deleteSlotById = async (slotId) => {
  const slot = await getSlotById(slotId);
  if (!slot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slot not found');
  }
  
  // Check if slot has any bookings
  const bookings = await models.Booking.find({ slot: slotId });
  
  if (bookings.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete slot with existing bookings');
  }
  
  await slot.remove();
  return slot;
};

/**
 * Get slots by creator
 * @param {ObjectId} userId
 * @returns {Promise<Slot[]>}
 */
const getSlotsByCreator = async (userId) => {
  return Slot.find({ createdBy: userId }).sort({ date: 1, startTime: 1 });
};

/**
 * Get slots for a specific date range
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Slot[]>}
 */
const getSlotsByDateRange = async (startDate, endDate) => {
  return Slot.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    isActive: true,
  }).sort({ date: 1, startTime: 1 });
};

/**
 * Get slot statistics
 * @returns {Promise<Object>}
 */
const getSlotStats = async () => {
  const totalSlots = await Slot.countDocuments();
  const activeSlots = await Slot.countDocuments({ isActive: true });
  const availableSlots = await Slot.countDocuments({
    isActive: true,
    $expr: { $lt: ['$currentBookings', '$maxBookings'] }
  });
  const fullSlots = await Slot.countDocuments({
    isActive: true,
    $expr: { $gte: ['$currentBookings', '$maxBookings'] }
  });
  
  return {
    totalSlots,
    activeSlots,
    availableSlots,
    fullSlots,
  };
};

module.exports = {
  createSlot,
  getSlotById,
  getSlotByIdPopulated,
  querySlots,
  getAvailableSlots,
  getAvailableSlotsWithUserStatus,
  updateSlotById,
  deleteSlotById,
  getSlotsByCreator,
  getSlotsByDateRange,
  getSlotStats,
}; 