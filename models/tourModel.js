/* eslint-disable import/no-extraneous-dependencies */

const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name can have max 40 characters'],
      minlength: [10, 'A tour name must have min 10 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a tour'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty can be one of these values: easy, medium, difficult',
      },
    },
    price: {
      type: Number,
      required: [true, 'The tour must have a price'],
    },
    priceDiscount: Number,
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating should be greater than 1.0'],
      max: [5, 'Rating can not be more than 5.0'],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Please also give us a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],

    slug: String,
    secretTours: {
      type: Boolean,
      default: false,
    },
    startLocations: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//pre-post hooks
// ----------------in order to embed documents-------------------
// tourSchema.pre('save',async function(next){
//   const guidePromises = this.guides.map(async id=>await User.findById(id))
//   this.guides = await Promise.all(guidePromises);
//   next();
// })

//indexes
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.pre('save', function (next) {
  //works on .save() & .create() not on .insertMany(), update()etc
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTours: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v,-passwordChangedAt',
  });
  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTours: { $ne: true } } });
  next();
});

//virtual property
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
