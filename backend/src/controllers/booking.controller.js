const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const services = require('../services');
const bookingService = services.bookingService;
const pick = require('../utils/pick');

const createBooking = catchAsync(async (req, res) => {
  const bookingBody = {
    ...req.body,
    user: req.user.id,
  };
  const booking = await bookingService.createBooking(bookingBody);
  res.status(httpStatus.CREATED).send(booking);
});

const getBookings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'user', 'slot']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await bookingService.queryBookings(filter, options);
  res.send(result);
});

const getAllBookings = catchAsync(async (req, res) => {
  const bookings = await bookingService.getAllBookings();
  res.send(bookings);
});

const getBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.getBookingByIdPopulated(req.params.bookingId);
  res.send(booking);
});

const updateBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.updateBookingById(req.params.bookingId, req.body);
  res.send(booking);
});

const cancelBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.bookingId, req.user.id);
  res.send(booking);
});

const completeBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.completeBooking(req.params.bookingId);
  res.send(booking);
});

const deleteBooking = catchAsync(async (req, res) => {
  await bookingService.deleteBookingById(req.params.bookingId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getMyUpcomingBookings = catchAsync(async (req, res) => {
  const bookings = await bookingService.getUpcomingBookingsByUser(req.user.id);
  res.send(bookings);
});

const getMyPastBookings = catchAsync(async (req, res) => {
  const bookings = await bookingService.getPastBookingsByUser(req.user.id);
  res.send(bookings);
});

const getUpcomingBookings = catchAsync(async (req, res) => {
  const bookings = await bookingService.getUpcomingBookings();
  res.send(bookings);
});

const getPastBookings = catchAsync(async (req, res) => {
  const bookings = await bookingService.getPastBookings();
  res.send(bookings);
});

const getBookingsByStatus = catchAsync(async (req, res) => {
  const { status } = req.params;
  const bookings = await bookingService.getBookingsByStatus(status);
  res.send(bookings);
});

const getBookingsBySlot = catchAsync(async (req, res) => {
  const { slotId } = req.params;
  const bookings = await bookingService.getBookingsBySlot(slotId);
  res.send(bookings);
});

const getBookingStats = catchAsync(async (req, res) => {
  const stats = await bookingService.getBookingStats();
  res.send(stats);
});

const canBookSlot = catchAsync(async (req, res) => {
  const { slotId } = req.params;
  const canBook = await bookingService.canUserBookSlot(req.user.id, slotId);
  res.send({ canBook });
});

module.exports = {
  createBooking,
  getBookings,
  getAllBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  completeBooking,
  deleteBooking,
  getMyUpcomingBookings,
  getMyPastBookings,
  getUpcomingBookings,
  getPastBookings,
  getBookingsByStatus,
  getBookingsBySlot,
  getBookingStats,
  canBookSlot,
}; 