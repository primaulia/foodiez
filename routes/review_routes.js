// UPDATE 20 Oct
// This route is where all the routes
// for /reviews goes
// be it POST, GET, or whatever

// this file is similar to `register_routes.js`

// require the model here
const Review = require('../models/review')
const express = require('express')
const router = express.Router()

// FIND ALL REVIEW
router.get('/', (req, res) => {
  Review.find()
  .populate('author')
  // it will go to the field called `author`
  // and look at the schema
  // find what it's referring to
  .then(data => res.send(data))
})

// CREATE NEW REVIEW
router.post('/', (req, res) => {
  // UPDATE BEFORE 20 OCT => update route to `/reviews` for uniformity sake
  // similar flow like registration
  // - take form data
  // - create new review

  // TODO: link currently logged in User with review form
  var formData = req.body

  var newReview = new Review({
    title: formData.title,
    description: formData.description,
    author: '59e81c0f83674583051f18b1'
  }) // creating empty `Review` object

  newReview.save() // save the object that was created
  .then(
    // success flow, for now is to redirect to all reviews route
    () => res.redirect('/reviews'),
    err => res.send('error happened')
  )
})

module.exports = router
