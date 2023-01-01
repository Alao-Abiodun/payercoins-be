const express = require('express');
const router = express.Router();

const authController = require('../../controllers/authController');
const upload = require("../../utils/libs/multer");
const uploadImage = require("../../utils/libs/multer-for-image");
const userController = require('../../controllers/users/index');

const { validateSchema } = require('../../utils/validations');

const {
  userSignUpSchema,
  resendEmailVerificationSchema,
  updatePasswordSchema,
  loginSchema,
  resetPasswordSchema,
  switchUserSchema
} = require('../../utils/validations/auth')


const getId = (req, res, next) => {
  const { id } = req.user;
  req.params.id = id;
  next();
};

// AUTH ROUTES
router.post('/signup', upload.single("businessDocument"), validateSchema(userSignUpSchema), authController.createUser);
router.get('/email/verify', authController.verifyEmail);
router.put('/email/verify/resend', validateSchema(resendEmailVerificationSchema), authController.resendEmailVerification);
router.post('/login', validateSchema(loginSchema), authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', validateSchema(resendEmailVerificationSchema), authController.forgotPassword);
router.put('/resetPassword/:resettoken', validateSchema(resetPasswordSchema), authController.resetPassword);

// Restrict route to only AUTHENTICATED users
// router.use(authController.protect);

// Current User Routes
router.patch('/updatePassword', validateSchema(updatePasswordSchema), authController.protect, authController.updatePassword);
router.patch('/switch', authController.protect, upload.single("businessDocument"), validateSchema(switchUserSchema), getId, userController.switchIndividualToBusiness);
router.get('/profile', authController.protect, getId, userController.getUserProfile);
router.patch('/updateImage', authController.protect, getId, uploadImage.single("profileImage"), userController.updateUserImage);
router.patch('/updateUser', authController.protect, getId, userController.updateUserProfile);
router.patch('/updateBusiness', authController.protect, userController.updateBusinessProfile);
router.get('/keys', authController.protect, userController.getEnvironmentalKeys);
router.get('/api-key', userController.getKeys);

// module.exports = router;
module.exports.authRouter = router;
