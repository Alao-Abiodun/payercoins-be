const mongoose = require('mongoose');

const fiatWithdrawalSettingsSchema = new mongoose.Schema({
    provider_to_use: {
      type: String,
      default: "flutterwave",
      enum: ["flutterwave", "fincra"],
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('FiatWithdrawalSettings', fiatWithdrawalSettingsSchema);
