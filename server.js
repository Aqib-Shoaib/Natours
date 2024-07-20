// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//handling uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(err.name, '-', err.message);
  console.log('UNCAUGHT EXCEPTION...APP SHUTTING DOWN!');
  // eslint-disable-next-line no-use-before-define
  server.close(() => {
    process.exit(1);
  });
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const uri = process.env.DATABASE_URL.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(uri).then(() => {
  console.log('Connected to MongoDB');
});

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening to ${PORT}...in ${process.env.NODE_ENV} mode...`);
});

//handling unhandlerd promise rejections
process.on('unhandledRejection', (err) => {
  console.log(err.name, '-', err.message);
  console.log('UNHANDLED REJECTION .... APP SHUTTING DOWN...!');
  server.close(() => {
    process.exit(1);
  });
});
