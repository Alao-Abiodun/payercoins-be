const express = require('express');
const { authorize } = require('../../middleware/index');
const Role = require('../../middleware/role');

const router = express.Router();

const adminAuthController = require('../../controllers/admin/auth');


const { validateSchema } = require('../../utils/validations');

const {
  resendEmailVerificationSchema,
  updatePasswordSchema,
  loginSchema,
  resetPasswordSchema,
} = require('../../utils/validations/auth')

const getId = (req, res, next) => {
  const { id } = req.user;
  req.params.id = id;
  next();
};

// admin auth routes
router.post('/create' ,adminAuthController.createSuperAdmin)
router.get('/email/verify', adminAuthController.verifyEmail);
router.put('/email/verify/resend', validateSchema(resendEmailVerificationSchema), adminAuthController.resendEmailVerification);
router.post('/login', validateSchema(loginSchema), adminAuthController.login);
router.get('/logout', adminAuthController.logout);
router.post('/forgotPassword', validateSchema(resendEmailVerificationSchema), adminAuthController.forgotPassword);
router.put('/resetPassword/:resettoken', validateSchema(resetPasswordSchema), adminAuthController.resetPassword);

// Protected routes

// Current User Routes
router.patch('/updatePassword', validateSchema(updatePasswordSchema), adminAuthController.protect, adminAuthController.updatePassword);
router.get('/profile', adminAuthController.protect, getId, authorize([Role.Admin, Role.SuperAdmin]), adminAuthController.getAdminProfile);
router.patch('/updateUser', adminAuthController.protect, getId, authorize([Role.Admin, Role.SuperAdmin]), adminAuthController.updateUserProfile);

module.exports = router;


