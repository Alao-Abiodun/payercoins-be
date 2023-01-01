const express = require('express'),
    router = express.Router();

const {
    createPaymentLink,
    paymentLinkDetails,
    verifyPayment
} = require('../../controllers/paymentLink');

const {
    protect,
    validatePubKey
} = require('../../controllers/authController');

router.post('/initiate', validatePubKey, createPaymentLink);
router.get('/details', paymentLinkDetails);
router.get('/verify', verifyPayment);

module.exports = router;