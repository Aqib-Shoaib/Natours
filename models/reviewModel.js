const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'A review should have a rating'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to some tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must have a author'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({tour:1,user:1},{unique:true});  //this line prevents duplicate reviews

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name, photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

//static method to calc some stats
reviewSchema.statics.calcAverage = async function (tourId) {
  //in static methods, the this keyword points to the model instead of the current doc
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRatings: { $avg: '$rating' },
      },
    },
  ]);

  //updating the tour doc
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//calling the above calcAverage static method using post hook
reviewSchema.post('save', function () {
  //this.constructor = Review model ---using it beccuase Review model is being defined after this hook
  //this keyword points to the doc that was just saved
  this.constructor.calcAverage(this.tour);
});

//for findByIdAndUpdate and findByIdAndDelete
reviewSchema.pre(/^findOne/, async function (next) {
  this.r = await this.findOne();
  next();
});
reviewSchema.post(/^findOne/, async function () {
  //using pre middleware above as a trick to overcome some limitations
  await this.r.constructor.calcAverage(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
