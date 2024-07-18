/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const GlobalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Relaxed Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Default source for all content types
      scriptSrc: ["'self'", 'http:', "'unsafe-inline'", "'unsafe-eval'"], // JavaScript sources
      styleSrc: ["'self'", 'http:', "'unsafe-inline'"], // CSS sources
      connectSrc: ["'self'", 'http:', 'ws:'], // AJAX, WebSocket, etc.
      fontSrc: ["'self'", 'http:', 'data:'], // Font sources
      imgSrc: ["'self'", 'data:', 'http:'], // Image sources
      objectSrc: ["'none'"], // For <object>, <embed>, or <applet>
      workerSrc: ["'self'", 'blob:'], // Worker sources
      frameSrc: ["'self'"], // Frame sources
    },
  }),
);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, try again in one hour',
});

app.use('/api', limiter);
app.use(express.json());
app.use(cookieParser());
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

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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

// To run code as sort of production in windows---uncomment following commands and run them on terminal or PowerShell, it worked for me!!!!!!!
// $env:NODE_ENV="production"
// nodemon server.js
