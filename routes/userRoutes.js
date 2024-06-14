//npm modules
const express = require('express');

const userController = require('../controllers/userController');
const userRouter = express.Router();
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
