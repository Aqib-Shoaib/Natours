const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const APPError = require('../utils/appError');

exports.getOverviewPage = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});
exports.getTourPage = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'user rating review',
  });

  if (!tour) {
    return next(new APPError('No Tour Found!', 400));
  }

  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login to your account',
  });
});
