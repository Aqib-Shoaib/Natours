//core modules
const fs = require('fs');
//3rd party modules
const express = require('express');

const app = express();
const PORT = 8000;
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

const getAllTours = (req, res) => {
  res.status(200).send({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};
const addTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const tour = Object.assign({ id: newId }, req.body);
  tours.push(tour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) console.log(err);
      return res.status(201).send({
        status: 'success',
        data: {
          tour,
        },
      });
    }
  );
};
const getTourData = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (!tour)
    return res.status(404).send({
      status: 'fail',
      message: 'Invalid tour ID',
    });
  res.status(200).send({
    status: 'success',
    data: {
      tour,
    },
  });
};
const patchTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length)
    return res.status(404).send({
      status: 'fail',
      message: 'Invalid tour ID',
    });
  res.status(200).send({
    status: 'success',
    data: {
      message: '<UPDATED CONTENT HERE!>',
    },
  });
};
const deleteTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length)
    return res.status(404).send({
      status: 'fail',
      message: 'Invalid tour ID',
    });
  res.status(200).send({
    status: 'success',
    data: {
      message: 'content deleted!',
    },
  });
};

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', addTour);
// app.get('/api/v1/tours/:id', getTourData);
// app.patch('/api/v1/tours/:id', patchTour);
// app.patch('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(addTour);

app
  .route('/api/v1/tours/:id')
  .get(getTourData)
  .post(patchTour)
  .delete(deleteTour);

app.listen(PORT, () => {
  console.log(`Listening to ${PORT}...`);
});
