const Joi = require('joi');


const createLink = Joi.object({
  // user: Joi.string().optional(),
  pageName: Joi.string().required(),
  description: Joi.string().required(),
  currency: Joi.array().items(Joi.string()).required(),
  isAmountFixed: Joi.boolean().required(),
  paymentSlug: Joi.string().optional(),
  amount: Joi.number().required(),
});

module.exports = {
  createLink,
};