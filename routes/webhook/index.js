const express = require("express");
const router = express.Router();

const { verifyFlutterwavePaymentWebhook } = require("../../services/flutterwaveWebhook");
const { verifyFincraPaymentWebhook } = require("../../services/fincraWebhook");

// Public route
router.post("/flutterwave", verifyFlutterwavePaymentWebhook);
router.post("/fincra", verifyFincraPaymentWebhook);

module.exports.webhookRoute = router;
