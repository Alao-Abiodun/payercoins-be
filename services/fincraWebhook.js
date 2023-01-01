const crypto = require("crypto");
const {
  completeWithdrawalRequest,
} = require("../controllers/admin/settlements");
require("dotenv").config();

const FincraPayoutModel = require("../models/fincraPayoutModel");

const verifyFincraPaymentWebhook = async (req, res) => {
  const validFincraHook = verifyFincraWebhook(req);
  if (validFincraHook) {
    const { body: fincraPaymentResponse } = req;
    const { withdrawal_request: withdrawalRequestId } =
      await FincraPayoutModel.findOne({
        reference: fincraPaymentResponse.data.reference,
      });
    if (req.body.event.toLowerCase() === "payout.successful") {
      // Complete withdrawal and notify user
      return await completeWithdrawalRequest(
        {
          withdrawalRequestId,
          provider: "fincra",
          withdrawalStatus: "completed",
          webhookResponse: fincraPaymentResponse.data,
        },
        res
      );
    } else {
      // Update withdrawal request status to fail when the withdrawal is not successful
      return await completeWithdrawalRequest(
        {
          withdrawalRequestId,
          provider: "fincra",
          withdrawalStatus: "failed",
          webhookResponse: fincraPaymentResponse.data,
        },
        res
      );
    }
  }
  // Redirect to payercoins if request isn't coming from Fincra
  return res.redirect("https://payercoins.com");
};

const verifyFincraWebhook = (req) => {
  const encryptedData = crypto
    .createHmac("SHA512", process.env.PAYERCOINS_FINCRA_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");
  const signatureFromWebhook = req.headers["signature"];

  //console.log(encryptedData);
  //console.log(signatureFromWebhook);
  if (encryptedData === signatureFromWebhook) {
    return true;
  } else {
    return false;
  }
};

module.exports = { verifyFincraPaymentWebhook };
