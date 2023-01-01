const mongoose = require('mongoose');

const paymentLinkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user'],
  },
  pageName: {
    type: String,
  },
  paymentSlug: {
    type: String,
  },
  amount: {
    type: Number,
  },
  paymentReference: {
    type: String,
  },
  environment: {
    type: String,
    enum: ['live', 'sandbox'],
    default: 'sandbox'
  },
  isDisabled: {
    type: Boolean,
    default: false,
    select: false,
  }
},
{ timestamps: true },
{
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
}
);

// QUERY MIDDLEWARE
// paymentLinkSchema.pre(/^find/, function (next) {
//   this.populate({
//     //Populates just the user document
//     path: 'user',
//   });
//   next();
// });

const PaymentLink = mongoose.model('PaymentLink', paymentLinkSchema);

module.exports = PaymentLink;