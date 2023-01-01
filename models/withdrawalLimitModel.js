const mongoose = require('mongoose');


const withdrawalLimitSchema = new mongoose.Schema({
    amount: {
        type: Number,
    },
    accountType: {
        type: String,
    },
    userType: {
        type: String,

    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WithdrawalLimit', withdrawalLimitSchema);