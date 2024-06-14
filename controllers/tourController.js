//core modules
const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'),
);

//middleware functions
exports.checkId = (req, res, next, val) => {
  const id = req.params.id * 1;
  // console.log(`param middleware id=${id} & val=${val} `);
  if (id > tours.length && id === val)
    return res.status(404).send({
      status: 'fail',
      message: 'Invalid tour ID',
    });
  next();
};

exports.checkBody = (req, res, next) => {
  const { name, price } = req.body;
  if (!name || !price)
    return res.status(400).send('Bad Request: Name or Price missing.');
  next();
};

//handler functions
exports.getAllTours = (req, res) => {
  res.status(200).send({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};
exports.addTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  // eslint-disable-next-line prefer-object-spread
  const tour = Object.assign({ id: newId }, req.body);
  tours.push(tour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) throw new Error(err);
      return res.status(201).send({
        status: 'success',
        data: {
          tour,
        },
      });
    },
  );
};
exports.getTourData = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  res.status(200).send({
    status: 'success',
    data: {
      tour,
    },
  });
};
exports.patchTour = (req, res) => {
  res.status(200).send({
    status: 'success',
    data: {
      message: '<UPDATED CONTENT HERE!>',
    },
  });
};
exports.deleteTour = (req, res) => {
  res.status(200).send({
    status: 'success',
    data: {
      message: 'content deleted!',
    },
  });
};
