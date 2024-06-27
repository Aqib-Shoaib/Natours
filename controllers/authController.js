/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const APPError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//helpers
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      User: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //if no email,password in req.body
  if (!email || !password) {
    return next(new APPError('Please Provide both email and Password', 401));
  }

  //checking if email exists
  const user = await User.findOne({ email }).select('+password');

  //checking if there is a user with provided email and password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new APPError('Incorrect email or Password', 401));
  }

  //sending the response if al guard clauses are passed
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
