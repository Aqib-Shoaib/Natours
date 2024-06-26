const Tour = require('../models/tourModel');
const APIfeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const APPError = require('../utils/appError');

//middleware
exports.aliasTopFive = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,difficulty,summary,ratingsAverage';
  next();
};

//handler functions

// ---------------------------get Tour data ---------------------------------
exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIfeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  //sending the response
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// -------------------------create new tour-----------------------------------
exports.addTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  if (!newTour) {
    return next(new APPError('NO Tour Found with the requested ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

// -------------------------get tour data of one single tour-----------------
exports.getTourData = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new APPError('NO Tour Found With the Requested ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// ----------------------------------tour patch(update)-----------------------------
exports.patchTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new APPError('NO Tour Found With the Requested ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// ---------------------------delete tour--------------------
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new APPError('NO Tour Found With the Requested ID', 404));
  }

  res.status(200).send({
    status: 'success',
    data: {
      message: 'content deleted!',
    },
  });
});

// ---------------------------aggregattion functions------------------
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStart: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
