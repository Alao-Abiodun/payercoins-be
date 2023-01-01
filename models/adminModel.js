const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const adminSchema = new mongoose.Schema({
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
  isVerified: {
    type: Boolean,
    default: false,
    select: false,
  },
  block: {
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
  role: {
    type: String, // either: ROL-ADMIN or ROL-SUPERADMIN
    default: 'ROL-ADMIN',
  },
  invitedBy: {
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

adminSchema.pre('save', async function (next) {
  // If password was modified
  if (!this.isModified('password')) return next();

  // Hash Password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

adminSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

adminSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

adminSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
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

adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken, 'utf8')
    .digest('hex');

  this.passwordResetExpires = Date.now() + 20 * 60 * 1000;

  return resetToken;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;