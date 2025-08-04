const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const bookingValidation = require('../../validations/booking.validation');
const bookingController = require('../../controllers/booking.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('createBookings'), validate(bookingValidation.createBooking), bookingController.createBooking)
  .get(auth('getBookings'), validate(bookingValidation.getBookings), bookingController.getBookings);

router
  .route('/all')
  .get(auth('manageBookings'), bookingController.getAllBookings);

router
  .route('/my-upcoming')
  .get(auth('getBookings'), bookingController.getMyUpcomingBookings);

router
  .route('/my-past')
  .get(auth('getBookings'), bookingController.getMyPastBookings);

router
  .route('/upcoming')
  .get(auth('manageBookings'), bookingController.getUpcomingBookings);

router
  .route('/past')
  .get(auth('manageBookings'), bookingController.getPastBookings);



router
  .route('/:bookingId')
  .get(auth('getBookings'), validate(bookingValidation.getBooking), bookingController.getBooking)
  .patch(auth('manageBookings'), validate(bookingValidation.updateBooking), bookingController.updateBooking)
  .delete(auth('manageBookings'), validate(bookingValidation.deleteBooking), bookingController.deleteBooking);

router
  .route('/:bookingId/cancel')
  .patch(auth('manageBookings'), validate(bookingValidation.cancelBooking), bookingController.cancelBooking);

router
  .route('/:bookingId/complete')
  .patch(auth('manageBookings'), validate(bookingValidation.completeBooking), bookingController.completeBooking);

module.exports = router; 