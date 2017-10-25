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

 20 Oct
 - refactoring routes
  - take a look at the file `route`, to see our current route plans
  - created 4 routes files as per route plans
  - removed `model` files `require` from index.js, except `User` and `Restaurant`
 - Register flow for `User`
  - update `pre('save')` hooks, to allow the plain text password => hashed password
 - Register and Login for `Admin`
  - similar to `User` create `pre('save')` hooks for register purposes
  - also added our first *INSTANCE METHOD* that helps us to compare login password
    and hashed password
  - added flow if register failed
    - checked if register with incorrect `admin registration code` === '42admin'
    - if incorrect, redirect to `/admin/register`
  - added flow if login failed
    - if email not found, redirected to `/admins/login`
    - if password is incorrect, redirected to `/admins/login`
  - created a search flow, through `fetch` POST request
    - new routes '/search' (GET & POST)
    - new front end js to start the `fetch`
    - embed jQuery to manipulate the dom
    - search in real time for currect restaurant in our db
    - new public folder that hosts our `static` files (unit 1 files)

  23 Oct
   - create .env file to store our server environment data
   - installed a new package `dotenv`, to allow our server to read the `.env` file
   - install express-session, in order for us to be able to create session data in our server
   - installed `connect-mongo`, to make sure the sessions created are stored into the db
   - installed `passport` and `passport-local` for controlling our register / login flow
   - initial use of `app.locals` to create local data for ALL routes

  After 23 Oct
   - created `helpers/index.js` file, that helped us to run functions can be run on different js files
   - use functions exported from `helpers/index.js` file to check if `session` is authenticated or not on route level
   - apply it on session sensitive routes
     - if user `hasLoggedOut()`, you can't go to
*/

// 23 Oct, BAE = require('dotenv')
// this is too make sure you can access the `.env` file
require('dotenv').config({ silent: true })

// setting all global variables (note: why const? cos it won't change)
// notice that port for mongodb is not really needed

// NOTICE: SPLIT SCREEN WITH `.env` file now
// notice the key name

// 23 Oct. check if you're in Heroku or not
const dbUrl =
process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : 'mongodb://localhost/test'
const port = process.env.PORT || 4000 // this is for our express server

const quoteApiKey = process.env.QUOTEAPI
console.log(`my api key is ${quoteApiKey}`)

// installing all modules
const express = require('express')
const path = require('path') // for Public files
const mongoose = require('mongoose') // for DB
const exphbs = require('express-handlebars') // for Handlebars
const bodyParser = require('body-parser') // for accessing POST request
const methodOverride = require('method-override') // for accessing PUT / DELETE

// UPDATE 23 Oct
const session = require('express-session') // to create session and cookies
const MongoStore = require('connect-mongo')(session) // to store session into db
const passport = require('./config/ppConfig') // to register passport strategies

// UPDATE AFTER 23 Oct
// ES6 METHOD TO DESTRUCTURE OBJECT: DESTRUCTURING - https://zellwk.com/blog/es6/
const { hasLoggedOut, isLoggedIn } = require('./helpers')

// requiring actual file now
// PITSTOP, look at file inside routes folder now

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
const admin_register_routes = require('./routes/admin_register_routes')

// UPDATE AFTER 20 OCT, setup login routes for `user`
const login_routes = require('./routes/login_routes')

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

// OCT 23. activation of session after you connect to mongoose
// MUST BE AFTER YOUR `mongoose.connect`
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  // store this to our db too
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

// OCT 23. must be below your session configuration
// THIS IS WHERE PASSPORT GOT ACTIVATED
app.use(passport.initialize())
app.use(passport.session())

// ROUTE sections
// note: remember all the model file we created on models/restaurant.js,
// we'll use it again
// UPDATE 20 Oct, we don't use the model in this file anymore

// UPDATE 20 Oct
// Refactoring routes
// HOMEPAGE

// UPDATE 23 OCT
// `app.locals` will set local data for ALL ROUTES

// so we don't need to do:
// res.render('/', {
//  user: req.user
// })
// AND
// res.render('/restraunts/new', {
//  user: req.user
// })

// why we use. `app.use`, because we want to apply this local data for EVERY routes
// `app.use` => GET, POST, PUT, DELETE request for ALL routes
app.use((req, res, next) => {
  // app.locals.title = 'Prima'
  app.locals.user = req.user // we'll only `req.user` if we managed to log in
  // return res.send(req.user)
  next()
})

app.delete('/deleterestaurant', (req, res) => {
  var restoId = req.body.restoId

  Restaurant.findByIdAndRemove(restoId)
  .then(() => {
    res.send({message: 'SAKSES'})
  })
  // .catch()



})

app.get('/', (req, res) => {
  // the return of then
  Restaurant.find().limit(9)
  .then(restaurants => {
    // at this point we got our data so we can render our page

    res.render('home', {
      restaurants,
      // title: 'Prima'
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
app.get('/profile', hasLoggedOut, (req, res) => {
  // UPDATE 23 OCT

  res.send(req.user)

  // res.send(`this is the profile page for ${req.params.slug}`)
  // findOne method is from mongoose. google it up
  // User.findOne({
  //   slug: req.params.slug
  // })
  // .then((user) => {
  //   // UPDATE BEFORE CLASS 20 Oct
  //   // render a new page with the user data found from the db
  //   res.render('users/show', {
  //     user
  //   })
  // }) // if i found the user
})

// NEW ROUTE - SEARCH - for realtime search of our restaurant db
app.get('/search', (req, res) => {
  res.render('search')
})

// NEW ROUTE - LOGOUT
app.get('/logout', hasLoggedOut, (req, res) => {
  req.logout()
  res.redirect('/')
})

// PSEUDOCODE
// - wait for any request with keyword data
// - if received, performed a find with keyword as a    //   regex patter
// - return a json back to the `frontend.js`
app.post('/search', (req, res) => {
  const keyword = req.body.keyword
  const regex = new RegExp(keyword, 'i')
  // make a regex patter out of the keyword
  // put an 'i' option so it's case INSENSITIVE

  Restaurant.find({
    name: regex
  })
  .limit(9)
  // so we don't show all
  // update 22 oct, show 9 for aesthetics
  .then(restaurants => res.send(restaurants))
  .catch(err => res.send(err)) // in case we have an error
})

// pass the request for /register
// to 'register_routes.js'
// pass the request for /reviews
// to 'review_routes.js'
// pass the request for /restaurants
// to 'restaurant_routes.js'

// NEW ROUTES - admin registration flow
app.use('/reviews', review_routes)
app.use('/restaurants', restaurant_routes)
app.use('/admin', admin_register_routes)

app.use('/register', isLoggedIn, register_routes)

// AFTER CLASS 20 Oct
// LOGIN FLOW FOR USER, similar to admin

// UPDATE 23 OCT. THIS IS VERY IMPORTANT ROUTES NOW AFTER PASSPORT
app.use('/login', isLoggedIn, login_routes)

// UPDATE 20 October,
// remove all registration routes in index.js
// remove all review routes in index.js
// remove all restaurant routes in index.js

// opening the port for express
app.listen(port, () => {
  console.log(`Server is running on ${port}`)
})
