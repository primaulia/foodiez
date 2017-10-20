// UPDATE 20 Oct
// This route is where all the routes
// for /restaurants goes
// be it POST, GET, or whatever

// this file is similar to `register_routes.js`

// require the model here
const Restaurant = require('../models/restaurant')
const express = require('express')
const router = express.Router()

// NOTICE: GROUP YOUR SIMILAR ROUTES TOGETHER
// E.G.
// router.get('/')
// router.post('/')

// router.get('/:id')
// router.post('/:id')

// FORM PAGE (NOT WITHIN CRUD)
// note: this route must be before '/restaurants/:id'. WHY?
router.get('/new', (req, res) => {
  res.render('restaurants/new')
})

// UPDATE 19 OCT
// PSEUDOCODE
// - check the url, if the param is 24 in length
// - run next route
// - if not
//  - find by slug
router.get('/:slug', (req, res, next) => {
  // res.send(`find existing restaurant with slug: ${req.params.slug.length}`)
  var slug = req.params.slug
  if (slug.length === 24) {
    next()
  } else {
    // this part here, runs if slug is less than 24
    // technically this part here, is the same like the part after
    Restaurant.findOne({
      slug // remember the es6 object literal
    })
    .populate('owner')
    .then(restaurant => {
      // UPDATE BEFORE CLASS 20 OCT
      // please take a look at the view file `restaurants/show`
      res.render('restaurants/show', {
        restaurant
      })
    })
  }
})

// READ ONE
router.get('/:id', (req, res) => {
  // instead of find all, we can `findById`
  Restaurant
  .findById(req.params.id) // no need limit since there's only one
  .populate('owner')
  // .populate(<field name>)
  .then(restaurant => {
    // not restaurants, cos it's single restaurant

    // PITSTOP: look at the views folders here, compare it with the res.render
    // first argument

    // res.send(restaurant)

    res.render('restaurants/show', {
      restaurant
    })
  })
  .catch(err => {
    console.log(err)
  })
})

// UPDATE ONE
// pseudocode
// get the id from the url
// get the updated value from form
// find restaurant object by id given
// update with the input from form
// save to the db
router.put('/:id', (req, res) => {
  // thankfully since we're using mongoose
  // we don't have to find and update separately
  // there's a method in mongoose just for that
  // `findByIdAndUpdate` http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate

  var formData = req.body
  Restaurant.findByIdAndUpdate(req.params.id, {
    name: formData.name,
    cuisine: formData.cuisine
  })
  .then(() => res.redirect(`/restaurants/${req.params.id}`))
  .catch(err => console.log(err))
  // after update is done, redirect back to resto id
  // this redirection can go to anywhere as long as you have the routes with you
})

// DELETE ONE
// pseudocode
// get the id from the url
// find restaurant object by id given
// delete the whole object from the db
router.delete('/:id', (req, res) => {
  // (AGAIN) thankfully since we're using mongoose
  // there's a method in mongoose just for that
  // `findByIdAndRemove` http://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove

  Restaurant.findByIdAndRemove(req.params.id)
  .then(() => res.redirect(`/`))
  .catch(err => console.log(err))
  // after delete is done, redirect back to home page
  // (cos the current restaurant page is gone)
  // this redirection can go to anywhere as long as you have the routes with you
})

// CREATE ONE
// pseudocode
// get the value from the form
// create new object based on that form
// save to the database
router.post('/', (req, res) => {
  var formData = req.body

  // remember how to create new object from constructor, it's back again
  // thanks to FORMIDABLE mongoose
  var newRestaurant = new Restaurant()
  newRestaurant.name = formData.name
  newRestaurant.cuisine = formData.cuisine

  // new field for `owner`
  newRestaurant.owner = '59e81ae9c90d27819c166d67'

  // when save function is done
  // the newRestaurant will have an id, hence we can go straight to the
  // newly created restaurant page

  // res.send(newRestaurant)
  // use `res.send` to test the output of anything

  newRestaurant.save()
  // UPDATE. 19 Oct
  .then(
    () => res.redirect(`/restaurants/${newRestaurant.id}`),
    err => res.send(err)
  ) // why? mongoose save(), doesn't have .catch()
})

module.exports = router
