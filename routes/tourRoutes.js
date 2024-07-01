//npm modules
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const tourRouter = express.Router();

// tourRouter.param('id', tourController.checkId);

tourRouter
  .route('/top-5-cheap')
  .get(
    authController.protect,
    tourController.aliasTopFive,
    tourController.getAllTours,
  );

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

tourRouter
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.addTour);

tourRouter
  .route('/:id')
  .get(tourController.getTourData)
  .patch(tourController.patchTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = tourRouter;
