const express = require('express');
const router = express.Router();

const configs = require('./config/index');

console.log('1');
console.log(configs.url.live.apiPaymentUrl);
console.log(configs.url.sandbox.apiPaymentUrl);

// get the payment link details
router.get(`${configs.url.sandbox.apiPaymentUrl}:reference`, require('./src/actions/get-payment-link-for-payment-page')(configs, 'sandbox'));
router.get(`${configs.url.live.apiPaymentUrl}:reference`, require('./src/actions/get-payment-link-for-payment-page')(configs, 'live'));

// get the payment page details
router.get(`${configs.url.sandbox.paymentPageUrl}:reference`, require('./src/actions/get-payment-page-info')(configs, 'sandbox'));
router.get(`${configs.url.live.paymentPageUrl}:reference`, require('./src/actions/get-payment-page-info')(configs, 'live'));

// add email, name, amount (if payment is custom price), message (optional)
router.post(`${configs.url.sandbox.apiPaymentUrl}:reference/info`, require('./src/actions/update-payment-link-basic-info')(configs, 'sandbox'));
router.post(`${configs.url.live.apiPaymentUrl}:reference/info`, require('./src/actions/update-payment-link-basic-info')(configs, 'live'));

// cancelling a payment
router.post(`${configs.url.sandbox.apiPaymentUrl}:reference/cancel`, require('./src/actions/cancel-payment-link')(configs, 'sandbox'));
router.post(`${configs.url.live.apiPaymentUrl}:reference/cancel`, require('./src/actions/cancel-payment-link')(configs, 'live'));

// processing a payment
router.post(`${configs.url.sandbox.apiPaymentUrl}:reference/process`, require('./src/actions/process-to-setup-payment')(configs, 'sandbox'));
router.post(`${configs.url.live.apiPaymentUrl}:reference/process`, require('./src/actions/process-to-setup-payment')(configs, 'live'));

// processing a page payment
router.post(`${configs.url.sandbox.paymentPageUrl}:reference/process`, require('./src/actions/proceed-to-setup-payment-page')(configs, 'sandbox'));
router.post(`${configs.url.live.paymentPageUrl}:reference/process`, require('./src/actions/proceed-to-setup-payment-page')(configs, 'live'));

// get processed a page payment
router.get(`${configs.url.sandbox.paymentPageUrl}:reference/:identifier`, require('./src/actions/get-payment-page-details')(configs, 'sandbox'));
router.get(`${configs.url.live.paymentPageUrl}:reference/:identifier`, require('./src/actions/get-payment-page-details')(configs, 'live'));

router.get(`${configs.url.sandbox.apiPaymentUrl}crypto/rate`, require('./src/actions/get-crypto-rate')(configs, 'sandbox'));
router.get(`${configs.url.live.apiPaymentUrl}crypto/rate`, require('./src/actions/get-crypto-rate')(configs, 'live'));

router.post('/threshold/sandbox/webhook', require('./src/actions/process-treshold-webhook')(configs, 'sandbox'));
router.post('/threshold/live/webhook', require('./src/actions/process-treshold-webhook')(configs, 'live'));

// get transaction fee
router.get(`${configs.url.sandbox.apiPaymentUrl}crypto/gas-fee`, require('./src/actions/get-crypto-gas-fee')(configs, 'sandbox'));
router.get(`${configs.url.live.apiPaymentUrl}crypto/gas-fee`, require('./src/actions/get-crypto-gas-fee')(configs, 'live'));

// module.exports = router;
module.exports.checkout = router;