const mongoose = require("mongoose");

const Withdrawal_request_schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    amount: String,
    amount_usd: String,
    fiat_amount: String,
    walletName: String,
    walletSlug: String,
    transaction: {},
    flutterwave_transaction: {},
    fincra_transaction: {},
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "processing", "failed", "completed"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Withdrawal_request",
  Withdrawal_request_schema
);
