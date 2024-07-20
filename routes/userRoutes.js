//npm modules
const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.protect, authController.logout);

userRouter.post('/forgot-password', authController.forgotPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);

//protecting routes by using middleware sequence
userRouter.use(authController.protect);

userRouter.patch(
  '/update-password',

  authController.updatePassword,
);

userRouter.get(
  '/me',

  userController.getMe,
  userController.getUserData,
);
userRouter.patch(
  '/updateMe',
  userController.uploadPhoto,
  userController.resizePhoto,
  userController.updateMe,
);
userRouter.delete('/deleteMe', userController.deleteMe);

//restricting the following routes to admin
userRouter.use(authController.restrictTo('admin'));

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
