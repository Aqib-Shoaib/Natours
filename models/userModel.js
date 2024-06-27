/* eslint-disable import/no-extraneous-dependencies */
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
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  //hashing the password beffore saving it
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
