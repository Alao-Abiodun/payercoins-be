const express = require('express');
const router = express.Router();

const {
  protect
} = require('../../controllers/authController');
//const otpController = require('../../controllers/otpController');
const {
  getTransactionFeePreference,
  updateTransactionFeePreference,
  getCallbackUrl,
  updateCallbackUrl,
  addSettlementPreference,
  getSettlementPreference,
  deleteSettlementPreference,
} = require('../../controllers/users');

const {
  getUserDetailsByUserId,
  getUserAPIKeysByUserId,
} = require('../../controllers/users/helper')

const KYC = require('../../controllers/KYC/verification');

router.get('/fee/preference', protect, getTransactionFeePreference);
router.post('/fee/preference', protect, updateTransactionFeePreference);

router.get('/callback-url', protect, getCallbackUrl);
router.post('/callback-url', protect, updateCallbackUrl);

router.get('/settlement/preference', protect, getSettlementPreference);
router.post('/settlement/preference', protect, addSettlementPreference);
router.delete('/settlement/preference', protect, deleteSettlementPreference);

router.post('/kyc/verify/individual/:identificationType', protect, KYC.verifyIndividual);
router.post('/kyc/verify/business', protect, KYC.verifyBusiness);

router.get('/get-user-info/:userId', async (req, res) => {
  
  const userInfo =  await getUserDetailsByUserId(req.params.userId);

  res.status(200).json({
    status: 'success',
    userInfo
  })
})

router.get("/get-user-api-keys/:userId", async (req, res) => {
  const userAPIKey = await getUserAPIKeysByUserId(req.params.userId);
  res.status(200).json({
    status: "success",
    userAPIKey,
  });
});

module.exports.userRouter = router;
