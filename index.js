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

// UPDATE 20 Oct
// We're only loading models at the route files
// but we're keeping `Restaurant` and `User` models here
// cos `/` and `/profile/:slug` need those models
const User = require('./models/user')
const Restaurant = require('./models/restaurant')


// UPDATE 20 Oct
// require all my route files
const register_routes = require('./routes/register_routes')
const review_routes = require('./routes/review_routes')
const restaurant_routes = require('./routes/restaurant_routes')

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
// UPDATE 20 Oct, we don't use the model in this file anymore

// UPDATE 20 Oct
// Refactoring routes
// HOMEPAGE
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

// pass the request for /register
// to 'register_routes.js'
// pass the request for /reviews
// to 'review_routes.js'
// pass the request for /restaurants
// to 'restaurant_routes.js'

app.use('/register', register_routes)
app.use('/reviews', review_routes)
app.use('/restaurants', restaurant_routes)

// UPDATE 20 October,
// remove all registration routes in index.js
// remove all review routes in index.js
// remove all restaurant routes in index.js

// opening the port for express
app.listen(port, () => {
  console.log(`Server is running on ${port}`)
})
