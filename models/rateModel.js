const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
    owner: String,
    rates: {},
}, {
    timestamps: true
});

module.exports = mongoose.model('Rate', rateSchema);