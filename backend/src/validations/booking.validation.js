const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBooking = {
  body: Joi.object().keys({
    slot: Joi.string().custom(objectId).required(),
    reasonForVisit: Joi.string().required().max(1000),
    contactNumber: Joi.string().required().pattern(/^[\+]?[1-9][\d]{0,15}$/),
    additionalNotes: Joi.string().max(1000).optional(),
  }),
};

const getBookings = {
  query: Joi.object().keys({
    status: Joi.string().valid('confirmed', 'cancelled', 'completed'),
    user: Joi.string().custom(objectId),
    slot: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBooking = {
  params: Joi.object().keys({
    bookingId: Joi.string().custom(objectId),
  }),
};

const updateBooking = {
  params: Joi.object().keys({
    bookingId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      reasonForVisit: Joi.string().max(1000),
      contactNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/),
      additionalNotes: Joi.string().max(1000),
      status: Joi.string().valid('confirmed', 'cancelled', 'completed'),
    })
    .min(1),
};

const deleteBooking = {
  params: Joi.object().keys({
    bookingId: Joi.string().custom(objectId),
  }),
};

const cancelBooking = {
  params: Joi.object().keys({
    bookingId: Joi.string().custom(objectId),
  }),
};

const completeBooking = {
  params: Joi.object().keys({
    bookingId: Joi.string().custom(objectId),
  }),
};

const getBookingsByStatus = {
  params: Joi.object().keys({
    status: Joi.string().valid('confirmed', 'cancelled', 'completed').required(),
  }),
};

const getBookingsBySlot = {
  params: Joi.object().keys({
    slotId: Joi.string().custom(objectId).required(),
  }),
};

const canBookSlot = {
  params: Joi.object().keys({
    slotId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  cancelBooking,
  completeBooking,
  getBookingsByStatus,
  getBookingsBySlot,
  canBookSlot,
}; 