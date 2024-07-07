//npm modules
const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);

userRouter.post('/forgot-password', authController.forgotPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);
userRouter.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword,
);

userRouter.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUserData,
);
userRouter.patch('/updateMe', authController.protect, userController.updateMe);
userRouter.delete('/deleteMe', authController.protect, userController.deleteMe);

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
