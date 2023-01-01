const mongoose = require('mongoose');

const manuallyUpdatedDepositTransaction = new mongoose.Schema(
  {
    transaction_id: {
      type: Number,
      required: true,
    },
    transaction_type: {
      type: String,
      enum: ['page-deposit', 'wallet-deposit', 'link-deposit'],
      required: true,
    },
    previous_balance: {
      type: Number,
      required: true,
    },
    current_balance: {
      type: Number,
      required: true,
    },
    crypto_wallet_id: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'ManuallyUpdatedDepositTransaction',
  manuallyUpdatedDepositTransaction
);
