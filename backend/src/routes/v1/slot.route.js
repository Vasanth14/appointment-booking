const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const slotValidation = require('../../validations/slot.validation');
const slotController = require('../../controllers/slot.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageSlots'), validate(slotValidation.createSlot), slotController.createSlot)
  .get(auth('getSlots'), validate(slotValidation.getSlots), slotController.getSlots);

router
  .route('/available')
  .get(slotController.getAvailableSlots);

router
  .route('/my-slots')
  .get(auth('manageSlots'), slotController.getSlotsByCreator);

router
  .route('/date-range')
  .get(auth('getSlots'), validate(slotValidation.getSlotsByDateRange), slotController.getSlotsByDateRange);

router
  .route('/:slotId')
  .get(auth('getSlots'), validate(slotValidation.getSlot), slotController.getSlot)
  .patch(auth('manageSlots'), validate(slotValidation.updateSlot), slotController.updateSlot)
  .delete(auth('manageSlots'), validate(slotValidation.deleteSlot), slotController.deleteSlot);

module.exports = router; 