const Joi = require('joi');
const { objectId } = require('./custom.validation');

const updateProfile = {
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().min(8).pattern(/^(?=.*[a-zA-Z])(?=.*\d)/).message('Password must contain at least one letter and one number'),
      name: Joi.string(),
    })
    .min(1),
};

module.exports = {
  updateProfile,
};
