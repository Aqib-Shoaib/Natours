const express = require('express');

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const viewRouter = express.Router();

viewRouter.get('/', authController.isLoggedIn, viewController.getOverviewPage);
viewRouter.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewController.getTourPage,
);
viewRouter.get(
  '/login',
  authController.isLoggedIn,
  viewController.getLoginForm,
);
viewRouter.get('/account', authController.protect, viewController.getAccount);

module.exports = viewRouter;
