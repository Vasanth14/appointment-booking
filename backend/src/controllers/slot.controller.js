const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const services = require('../services');
const slotService = services.slotService;
const pick = require('../utils/pick');

const createSlot = catchAsync(async (req, res) => {
  const slotBody = {
    ...req.body,
    createdBy: req.user.id,
  };
  const slot = await slotService.createSlot(slotBody);
  res.status(httpStatus.CREATED).send(slot);
});

const getSlots = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['isActive', 'date', 'createdBy']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await slotService.querySlots(filter, options);
  
  // If no pagination options are provided, return just the results array
  if (!options.limit && !options.page) {
    res.send(result.results);
  } else {
    res.send(result);
  }
});

const getAvailableSlots = catchAsync(async (req, res) => {
  // If user is authenticated, include their booking status
  if (req.user && req.user.id) {
    const slots = await slotService.getAvailableSlotsWithUserStatus(req.user.id);
    res.send(slots);
  } else {
    // For unauthenticated users, return basic available slots
    const slots = await slotService.getAvailableSlots();
    res.send(slots);
  }
});

const getSlot = catchAsync(async (req, res) => {
  const slot = await slotService.getSlotByIdPopulated(req.params.slotId);
  res.send(slot);
});

const updateSlot = catchAsync(async (req, res) => {
  const slot = await slotService.updateSlotById(req.params.slotId, req.body);
  res.send(slot);
});

const deleteSlot = catchAsync(async (req, res) => {
  await slotService.deleteSlotById(req.params.slotId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getSlotStats = catchAsync(async (req, res) => {
  const stats = await slotService.getSlotStats();
  res.send(stats);
});

const getSlotsByCreator = catchAsync(async (req, res) => {
  const slots = await slotService.getSlotsByCreator(req.user.id);
  res.send(slots);
});

const getSlotsByDateRange = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: 'Start date and end date are required',
    });
  }
  
  const slots = await slotService.getSlotsByDateRange(new Date(startDate), new Date(endDate));
  res.send(slots);
});

const refreshAllBookingCounts = catchAsync(async (req, res) => {
  const count = await slotService.refreshAllBookingCounts();
  res.send({ message: `Refreshed booking counts for ${count} slots` });
});

module.exports = {
  createSlot,
  getSlots,
  getAvailableSlots,
  getSlot,
  updateSlot,
  deleteSlot,
  getSlotStats,
  getSlotsByCreator,
  getSlotsByDateRange,
  refreshAllBookingCounts,
}; 