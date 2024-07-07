const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const APPError = require('../utils/appError');
const factory = require('./handlerFactory');

//helpers
function filterObj(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
}

//handlers

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new APPError(
        'You can not update user password or password confirm field via this route',
        400,
      ),
    );
  }
  //updating the document
  const filteredObj = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  //sending the updated user
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'deleted',
    data: null,
    message: 'User deleted',
  });
});

exports.getMe = (req,res,next)=>{
  req.params.id = req.user.id;
  next();
}

exports.addUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: 'This route is not yet implmeneted, use /signup instead',
  });
};


exports.getAllUsers = factory.getAll(User);
exports.getUserData = factory.getOne(User);
exports.patchUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
