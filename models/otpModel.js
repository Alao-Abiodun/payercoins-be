const mongoose = require('mongoose');

const minuteFromNow = function(){
    const timeObject = new Date();
    timeObject.setTime(timeObject.getTime() + 1000 * 60 * 5);
    return timeObject;
};

const otpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    email: {
        type: String,
        unique: true
    },
    phone: {
        type: String,
        unique: true
    },
    code: {
        type: String,
        unique: true
    },
    data: {},
    expireAt: {
        type: Date,
        default: minuteFromNow,
        index: { expires: '5m' },
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Otp', otpSchema);