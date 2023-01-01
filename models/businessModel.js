const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    businessName: {
      type: String, 
      required: [true, 'Please add a business name'] 
    },
    businessIndustry: {
      type: String, 
      required: [true, 'Please add a business industry'] 
    },
    businessEmail: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, 'Please enter your email address!'],
    },
    businessRole: {
      type: String,
    },
    businessURL: {
      type: String,
    },
    description: {
      type: String 
    },
    businessAddress: {
      type: String,
    },
    businessDocument: {
      type: String,
    },
    isBusinessVerified: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
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


//Make sure subject name are unique across categories
businessSchema.index({ businessName: 1, user: 1 }, { unique: true });

// QUERY MIDDLEWARE
businessSchema.pre(/^find/, function (next) {
  this.populate({
    //Populates just the user document
    path: 'user',
    select: '-isBusiness',
  });
  next();
});

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;