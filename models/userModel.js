/* eslint-disable import/no-extraneous-dependencies */
const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'A user must have a valid email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'This is not a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please give us a strong password'],
    minLenght: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'This field is required'],
    validate: {
      //this only works on .save() and .create() remember?
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordTokenExpiresAt: Date,
  active: {
    type: Boolean,
    select: false,
    defualt: true,
  },
});

//middlrewares
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  //hashing the password beffore saving it
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//instance methods
userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword,
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(JWTTimestamp, passwordTimestamp);
    return JWTTimestamp < passwordTimestamp; //100 > 200
  }

  return false;
};

userSchema.methods.changePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordTokenExpiresAt = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
