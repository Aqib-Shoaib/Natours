/* eslint-disable import/no-extraneous-dependencies */
//npm modules

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

//custom module exports
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const GlobalErrorHandler = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, try again in one hour',
});

app.use('/api', limiter);
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'difficulty',
      'price',
      'ratingsQuantity',
      'ratingsAverage',
    ],
  }),
);
app.use(express.static(`${__dirname}/public/`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  const err = new Error(
    `Can't find requested url ${req.originalUrl} on this server!`,
  );
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
});

app.use(GlobalErrorHandler);

module.exports = app;

//to run code as sort of production in windows---uncomment following commands and run them on terminal or powershell, it worked for me!!!!!!!
// $env:NODE_ENV="production"
// nodemon server.js
