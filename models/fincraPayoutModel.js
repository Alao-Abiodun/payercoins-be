const mongoose = require('mongoose');

const fincraPayoutSchema = new mongoose.Schema({
    withdrawal_request: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FincraPayout', fincraPayoutSchema);
