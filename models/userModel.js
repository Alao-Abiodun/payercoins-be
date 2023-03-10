const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');


const userSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    lowercase: true,
    required: [true, 'Please enter your First Name!'],
  },
  lastName: {
    type: String,
    lowercase: true,
    required: [true, 'Please enter your Last Name!'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Please enter your email address!'],
  },
  country: {
    type: String, 
    required: [true, 'Please add a country'] 
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: [true, 'Please enter your phone Number!'],
  },
  isVerified: {
    type: Boolean,
    default: false,
    select: false,
  },
  isUserVerified: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
    select: false,
  },
  isBusiness: {
    type: Boolean,
    default: false,
    select: false,
  },
  profileImage: {
    type: String,
    lowercase: true,
    default: "https://res.cloudinary.com/oluwatobiloba/image/upload/v1628753027/Grazac/avatar_cihz37.png",
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: 8,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  userType: {
    type: String,
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

userSchema.pre('save', async function (next) {
  // If password was modified
  if (!this.isModified('password')) return next();

  // Hash Password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Cascade delete subjects when a user is deleted
userSchema.pre('remove', async function (next) {
  //console.log(`Business being removed from user ${this._id}-${this.businessName}`);
  await this.model('business').deleteMany({ user: this._id });
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // Password not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken, 'utf8')
    .digest('hex');

  this.passwordResetExpires = Date.now() + 20 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;