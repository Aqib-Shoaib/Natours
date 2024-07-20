/* eslint-disable no-restricted-syntax */
const { MongooseError } = require('mongoose');
const APPError = require('../utils/appError');

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new APPError(message, 400);
}

function handleDuplicateKeyErrorDB(err) {
  const message = `Duplicate Key: ${err.keyValue.name}`;
  return new APPError(message, 400);
}

function handleValidationErrorDB(err) {
  const { message } = err;
  return new APPError(message, 400);
}

const handleJWTError = (err) =>
  new APPError(`${err.message},Please login again!`, 401);
const handleJWTExpired = (err) =>
  new APPError(`${err.message},Please login again`, 401);

//error sender functions
function sendErrorDev(err, req, res) {
  //error within api
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //error within rendered website
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
}
function sendErrorProd(err, req, res) {
  //error within api
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.log('error----', err);
    return res.status(500).json({
      status: 'fail',
      err: err,
      message: 'Internal Server Error!',
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error',{
      title: 'Something went wrong!',
      msg:err.message,
    });
  }
  console.log('error----', err);
  return res.status(500).render('error',{
    title:"Server Error!",
    msg: 'Internal Server Error'
  });
}

//error copying functions
function copyError(err) {
  const errorCopy = {};

  // Get all property names, including non-enumerable ones
  const propNames = Object.getOwnPropertyNames(err);
  for (const propName of propNames) {
    errorCopy[propName] = err[propName];
  }

  return errorCopy;
}

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    let error = copyError(err);

    // the tutor @jonas.io used error.name === 'CastError' but it doesn't work in my case so i took some help from chatgpt and modified it this ways
    if (err instanceof MongooseError.CastError)
      error = handleCastErrorDB(error);

    //handling duplicate key error
    if (error.codeName === 'DuplicateKey')
      error = handleDuplicateKeyErrorDB(error);

    //handling validation error
    if (error._message === 'Validation failed')
      error = handleValidationErrorDB(error);

    //invalid jwt token error
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);

    //token expired error
    if (error.name === 'TokenExpiredError') error = handleJWTExpired(error);

    //sending final error to the handler
    sendErrorProd(error, req, res);
  } else if (process.env.NODE_ENV === 'development') {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    sendErrorDev(err, req, res);
  }

  next();
};
