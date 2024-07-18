const express = require('express');

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const viewRouter = express.Router();

viewRouter.use(authController.isLoggedIn);

viewRouter.get('/', viewController.getOverviewPage);
viewRouter.get('/tour/:slug', viewController.getTourPage);
viewRouter.get('/login', viewController.getLoginForm);

module.exports = viewRouter;
