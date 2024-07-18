//npm modules
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const tourRouter = express.Router();

// tourRouter.param('id', tourController.checkId);

tourRouter.use('/:tourId/review', reviewRouter);

tourRouter
  .route('/top-5-cheap')
  .get(
    authController.protect,
    tourController.aliasTopFive,
    tourController.getAllTours,
  );

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

tourRouter
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.addTour,
  );

tourRouter
  .route('/:id')
  .get(tourController.getTourData)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.patchTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = tourRouter;
