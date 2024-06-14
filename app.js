//npm modules
const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
//custom module exports
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

dotenv.config({ path: './config.env' });

app.use(express.static(`${__dirname}/public/`));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
