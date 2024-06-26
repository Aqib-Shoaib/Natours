//npm modules

const express = require('express');
const morgan = require('morgan');
//custom module exports
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const GlobalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(express.static(`${__dirname}/public/`));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

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
