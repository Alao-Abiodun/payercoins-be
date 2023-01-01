const mongoose = require('mongoose');

const paymentLinkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user'],
    },
    invoice_id: {
        type: String,
    },
    redirect_url: {
        type: String,
    },
    callback_url: {
        type: String,
    },
    amount: {
        type: Number,
    },
    reference: {
        type: String,
    },
    payment_link_endpoint: {
        type: String,
    },
    environment: {
        type: String,
        enum: ['live', 'sandbox'],
        default: 'sandbox'
    }
}, { timestamps: true });

const SDKPaymentLink = mongoose.model('SDKPaymentLink', paymentLinkSchema);

module.exports = SDKPaymentLink;