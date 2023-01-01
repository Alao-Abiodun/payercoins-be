const mongoose = require('mongoose');

const manualCryptoWalletTransaction = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    transaction_id: {
      type: Number,
      required: true,
    },
    transaction_type: {
      type: String,
      default: 'wallet-deposit'
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
    crypto_symbol: {
      type: String,
      required: true,
    },
    initiated_by: {
      type: mongoose.Types.ObjectId,
      ref: 'Admin'
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'ManualCryptoWalletTransaction',
  manualCryptoWalletTransaction
);
