const {
  completeWithdrawalRequest,
} = require("../controllers/admin/settlements");

const verifyFlutterwavePaymentWebhook = async (req, res) => {
  const validFlutterwaveHook = verifyFlutterwaveWebhook(req);
  if (validFlutterwaveHook) {
    const { body: flutterwavePaymentResponse } = req;
    if (
      req.body.data.status.toLowerCase() === "successful"
    ) {
      if (flutterwavePaymentResponse.data.meta.settlementId) {
        // Complete withdrawal and notify user
        return await completeWithdrawalRequest({
          provider: 'flutterwave',
          withdrawalStatus: 'completed',
          webhookResponse: flutterwavePaymentResponse.data,
        }, res);
      }
    } else {
      // Update withdrawal request status to fail when the withdrawal is not successful
      return await completeWithdrawalRequest({
        provider: 'flutterwave',
        withdrawalStatus: 'failed',
        webhookResponse: flutterwavePaymentResponse.data,
      }, res);
    }
  }
  // Redirect to payercoins if request isn't coming from Flutterwave
  return res.redirect('https://payercoins.com');
};

const verifyFlutterwaveWebhook = (req) => {
  const hash = process.env.PAYERCOINS_FLUTTERWAVE_HASH;
  if (hash === req.headers["verif-hash"]) {
    return true;
  }
  return false;
};

module.exports = { verifyFlutterwavePaymentWebhook };
