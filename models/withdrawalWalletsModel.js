const mongoose = require('mongoose');

const withdrawalWalletSchema = mongoose.Schema({
    owner: String,
    wallets: {},
}, {
    timestamps: true
})

module.exports = mongoose.model('withdrawal_wallets', withdrawalWalletSchema);