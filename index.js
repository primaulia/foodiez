/*
  changelogs:

  19 Oct
  - new models => user and review
  - relationship =>
    - review.author => user._id
    - restaurant.owner => user._id
  - using postman to test routes response
  - registration flow => POST '/register' with hardcoded: name, email, password
  - new review flow => POST '/review' with hardcoded: title, description, author( user._id)
  - get all reviews flow => GET '/reviews' with populated `author`
  - update on new restaurant flow => POST '/restaurant' with hardcoded `author`
  - creating `pre-save` hooks for `User` schema
    - so we can create routes `/profile/:slug`, making it more readable rather than using user._id
  - creating `pre-save` hooks for `Restaurant` schema
    - so we can create routes `/restaurants/:slug`, making it more readable rather than using restaurant._id
    - in a case that the url is not providing a `slug`, fallback to `/restaurants/:id` route
*/


// setting all global variables (note: why const? cos it won't change)
// notice that port for mongodb is not really needed
const dbUrl = 'mongodb://localhost/test'
const port = 4000 // this is for our express server

// installing all modules
const express = require('express')
const path = require('path') // for Public files
const mongoose = require('mongoose') // for DB
const exphbs = require('express-handlebars') // for Handlebars
const bodyParser = require('body-parser') // for accessing POST request
const methodOverride = require('method-override') // for accessing PUT / DELETE

// requiring actual file now
// PITSTOP, look at file inside models folder now
const Restaurant = require('./models/restaurant')
const User = require('./models/user')
const Review = require('./models/review')

// initiating express, by calling express variable
const app = express()

// VIEW ENGINES aka handlebars setup
app.engine('handlebars', exphbs({ defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

// MIDDLEWARES (explained on thursday)
app.use(express.static(path.join(__dirname, 'public')))
app.use(function (req, res, next) {
  console.log('Method: ' + req.method + ' Path: ' + req.url)
  next()
})
// setup bodyParser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
// setup methodOverride
app.use(methodOverride('_method'))

// connecting to mongodb before we starting the server
// via mongoose
mongoose.Promise = global.Promise // the formidable Promise, so we can use .then()
mongoose.connect(dbUrl, {
  // this means that technically mongoose use the same technique
  // like MongoClient.connect
  useMongoClient: true
}) // http://mongoosejs.com/docs/connections.html
.then(
  () => { console.log('db is connected') },
  (err) => { console.log(err) }
)

// ROUTE sections
// note: remember all the model file we created on models/restaurant.js,
// we'll use it again

// 19 OCT
// NOW I'M ABLE TO CREATE NEW USER, BUT WE NEED TO REQUIRE
// THE MODEL FILE FIRST

// NEW ROUTE - REGISTER - to show the new user form
app.get('/register', (req, res) => {
  res.render('users/register')
})

// NEW ROUTE - PROFILE - to show the user profile page
// pseudocode
// get the slug
// find user by the slug
// render profile page with user details based on the slug
app.get('/profile/:slug', (req, res) => {
  // res.send(`this is the profile page for ${req.params.slug}`)
  // findOne method is from mongoose. google it up
  User.findOne({
    slug: req.params.slug
  })
  .then((user) => {
    // UPDATE BEFORE CLASS 20 Oct
    // render a new page with the user data found from the db
    res.render('users/show', {
      user
    })
  }) // if i found the user
})

// NEW ROUTE - POST NEW USER - to handle register form submission
// psuedocode
// - read the form data
// - create new user object
// - use mongoose to create those document in the db
// - redirect to somewhere
app.post('/register', (req, res) => {
  // UPDATE BEFORE CLASS 20 Oct
  var formData = req.body
  var newUser = new User({
    name: formData.name,
    // this name => slug => alex-min
    // hence, /profile/alex-min
    email: formData.email,
    password: formData.password // NOTICE, we're going to update this
  })

  // // PITSTOP: UPDATE UPDATE
  // // no .catch() for save
  // // this is very similar to how mongoose.connect
  newUser.save() // save the object that was created
  .then(
    user => res.redirect(`/profile/${user.slug}`),
    // success flow, redirect to profile page
    err => res.send(err) // error flow
  )
})

// FIND ALL REVIEW
app.get('/reviews', (req, res) => {
  Review.find()
  .populate('author')
  // it will go to the field called `author`
  // and look at the schema
  // find what it's referring to
  .then(data => res.send(data))
})

// CREATE NEW REVIEW
app.post('/reviews', (req, res) => {
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

// READ ALL
app.get('/', (req, res) => {
  // the return of then
  Restaurant.find().limit(10)
  .then(restaurants => {
    // at this point we got our data so we can render our page

    res.render('home', {
      restaurants
      // remember object literal on es6, we don't need to type in pairs
      // if key and argument is the same name
      // i.e. restaurants: restaurants
    })
  })
  .catch(err => {
    console.log(err)
  })
})

// FORM PAGE (NOT WITHIN CRUD)
// note: this route must be before '/restaurants/:id'. WHY?
app.get('/restaurants/new', (req, res) => {
  res.render('restaurants/new')
})

// UPDATE 19 OCT
// PSEUDOCODE
// - check the url, if the param is 24 in length
// - run next route
// - if not
//  - find by slug
app.get('/restaurants/:slug', (req, res, next) => {
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
app.get('/restaurants/:id', (req, res) => {
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

// CREATE ONE
// pseudocode
// get the value from the form
// create new object based on that form
// save to the database
app.post('/restaurants', (req, res) => {
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

// UPDATE ONE
// pseudocode
// get the id from the url
// get the updated value from form
// find restaurant object by id given
// update with the input from form
// save to the db
app.put('/restaurants/:id', (req, res) => {
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
app.delete('/restaurants/:id', (req, res) => {
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

// opening the port for express
app.listen(port, () => {
  console.log(`Server is running on ${port}`)
})
