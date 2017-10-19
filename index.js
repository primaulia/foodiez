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
  res.send('register form page')
})

// NEW ROUTE - POST NEW USER - to handle register form submission
// psuedocode
// - read the form data
// - create new user object
// - use mongoose to create those document in the db
// - redirect to somewhere
app.post('/register', (req, res) => {
  var newUser = new User({
    name: 'Shumin',
    email: 'shumin@ga.co',
    password: 'test123'
  }) // creating empty `User` object

  newUser.save() // save the object that was created
  .then( () => res.send('user is saved'))
  .catch( err => res.send(err) )

  // if we can run then(), the user has been saved

  // res.send(newUser)
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

// READ ONE
app.get('/restaurants/:id', (req, res) => {
  // instead of find all, we can `findById`
  Restaurant.findById(req.params.id) // no need limit since there's only one
  .then(restaurant => {
    // not restaurants, cos it's single restaurant

    // PITSTOP: look at the views folders here, compare it with the res.render
    // first argument

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

  // when save function is done
  // the newRestaurant will have an id, hence we can go straight to the
  // newly created restaurant page
  newRestaurant.save()
  .then(() => res.redirect(`/restaurants/${newRestaurant.id}`))
  .catch(err => console.log(err))
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
