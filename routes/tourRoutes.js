//npm modules
const express = require('express');
const tourController = require('../controllers/tourController');

const tourRouter = express.Router();

// tourRouter.param('id', tourController.checkId);

tourRouter
  .route('/top-5-cheap')
  .get(tourController.aliasTopFive, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.addTour);

tourRouter
  .route('/:id')
  .get(tourController.getTourData)
  .patch(tourController.patchTour)
  .delete(tourController.deleteTour);

module.exports = tourRouter;
