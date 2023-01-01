const Joi = require("joi");

const userSignUpSchema = Joi.object({
  userType: Joi.string().valid("individual", "business"),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  country: Joi.string().required(),
  phoneNumber: Joi.string()
    .regex(/^[+][0-9]{11}/)
    .min(12)
    .max(14),
  password: Joi.string()
    // regex for 8 characters, special characters, numbers and upper and lower case letters
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?.!@$%^&*-]).{8,}$/)
    .min(8)
    .max(20)
    .required(),
  businessName: Joi.string().optional(),
  businessIndustry: Joi.string().optional(),
  businessEmail: Joi.string().email().optional(),
  businessRole: Joi.string().optional(),
  businessURL: Joi.string().optional(),
  description: Joi.string().optional(),
  businessAddress: Joi.string().optional(),
  confirm: Joi.string().optional(),
});

const resendEmailVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(8).max(20).required(),
  newPassword: Joi.string().min(8).max(20).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(8).max(20).required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).max(20).required(),
  resettoken: Joi.string().optional(),
});

const switchUserSchema = Joi.object({
  businessName: Joi.string().required(),
  country: Joi.string().required(),
  businessIndustry: Joi.string().required(),
  businessEmail: Joi.string().email().required(),
  businessRole: Joi.string().required(),
  businessURL: Joi.string().required(),
  description: Joi.string().required(),
  businessAddress: Joi.string().required(),
});

module.exports = {
  userSignUpSchema,
  resendEmailVerificationSchema,
  updatePasswordSchema,
  loginSchema,
  resetPasswordSchema,
  switchUserSchema,
};
