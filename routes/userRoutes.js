//npm modules
const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.addUser);

userRouter
  .route('/:id')
  .get(userController.getUserData)
  .post(userController.patchUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
