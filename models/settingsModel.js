const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    environment: {
        type: String,
        enum: ['live', 'sandbox'],
        default: 'live'
    },
    wallets: {
        type: [],
        default: ['bitcoin', 'ethereum', 'usdt-trx']
    },
    transaction_fees_preference: {
        type: String,
        default: 'merchant',
        enum: ['merchant', 'user']
    },
    settlements: {},
    api_keys: {},
    callback_url: {}
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingSchema);