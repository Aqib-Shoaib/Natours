/* eslint-disable import/no-extraneous-dependencies */
const { promisify } = require('util');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const APPError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

//helpers
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
}

function createSendToken(user, statusCode, res) {
  const token = signToken(user._id);
  const cookieOptions = {
    expiresIn: process.env.JWT_COOKIE_EXPIRES,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
}

//handlers
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt || undefined,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
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
  createSendToken(user, 200, res);
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );
      const freshUser = await User.findById(decode.id);
      if (!freshUser) return next();
      if (freshUser.changedPassword(decode.iat)) return next();

      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  //getting the token if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(
      new APPError('Please login to get access, you are not logged in!', 401),
    );
  //verifying the token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decode);   the JWT Expiry error and invalid token error have been handled in global error handler

  //checking if the user exists or the password has been changed within the expiry time
  const freshUser = await User.findById(decode.id);
  if (!freshUser) {
    return next(
      new APPError('The User Belonging to this token does not exists', 401),
    );
  }
  if (freshUser.changedPassword(decode.iat)) {
    return next(
      new APPError(
        'The user recently changed there password,please login again',
        401,
      ),
    );
  }

  //if all guard clauses pass
  req.user = freshUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new APPError(
          'You do not have the permissions to perform this action',
          403,
        ),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  const resetToken = user.changePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

  const message = `We recieved a request a for password update from this gmail. If you made that request, then follow this url: ${resetUrl} \n Otherwise just ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password reset token(valid for 10 mins)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'token sent via mail',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordTokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new APPError(
        'There was some error in sending reset password email.Please try again later',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //getting the token from the params and then hashing it
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //getting the relevant user from the database
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(new APPError('Invalid Token or Expired Token!', 400));
  }

  //setting up the new fields
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordTokenExpiresAt = undefined;
  await user.save();

  // the "passwordChangedAt" property is being set through a middleware function

  //sending the new token to log in the same user
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //find the user
  const user = await User.findById(req.user.id).select('+password');

  //password verification
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new APPError('Your current password is wrong', 401));
  }

  //password update
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //sending the token
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expiresIn: new Date(Date.now() * 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};
