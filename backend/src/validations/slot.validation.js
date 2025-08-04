const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSlot = {
  body: Joi.object().keys({
    date: Joi.date().required(),
    startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    maxBookings: Joi.number().integer().min(1).max(1).default(1),
    description: Joi.string().max(500).optional(),
  }),
};

const getSlots = {
  query: Joi.object().keys({
    isActive: Joi.boolean(),
    date: Joi.date(),
    createdBy: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSlot = {
  params: Joi.object().keys({
    slotId: Joi.string().custom(objectId),
  }),
};

const updateSlot = {
  params: Joi.object().keys({
    slotId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      date: Joi.date(),
      startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      maxBookings: Joi.number().integer().min(1).max(1),
      description: Joi.string().max(500),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const deleteSlot = {
  params: Joi.object().keys({
    slotId: Joi.string().custom(objectId),
  }),
};

const getSlotsByDateRange = {
  query: Joi.object().keys({
    startDate: Joi.date().required(),
    endDate: Joi.date().required().min(Joi.ref('startDate')),
  }),
};

module.exports = {
  createSlot,
  getSlots,
  getSlot,
  updateSlot,
  deleteSlot,
  getSlotsByDateRange,
}; 