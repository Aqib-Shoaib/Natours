const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  //sending the response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});
exports.addUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: "Can't Provide this data right now!",
  });
};
exports.getUserData = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: "Can't Provide this data right now!",
  });
};
exports.patchUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: "Can't Provide this data right now!",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: "Can't Provide this data right now!",
  });
};
