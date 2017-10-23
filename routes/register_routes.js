// 19 OCT
// NOW I'M ABLE TO CREATE NEW USER, BUT WE NEED TO REQUIRE
// THE MODEL FILE FIRST

// UPDATE 20 Oct
// This page is where all the routes
// for /register goes
// be it POST, GET, or whatever

// UPDATE 23 Oct
// Same thing as we do here
// we'll set up the session too via passport
// hence we need to require `ppConfig.js` here again
const passport = require('../config/ppConfig')

// require the model here
const User = require('../models/user')

const express = require('express')
// this is to borrow the router fn of express
// not to start express server here
const router = express.Router()

// NEW ROUTE - REGISTER - to show the new user form
// but now inside a router page

// why '/', because all routes here is coming
// from /register anyway

router.get('/', (req, res) => {
  res.render('users/register')
})

// NEW ROUTE - POST NEW USER - to handle register form submission
// psuedocode
// - read the form data
// - create new user object
// - use mongoose to create those document in the db
// - redirect to somewhere
router.post('/', (req, res) => {
  // UPDATE BEFORE CLASS 20 Oct
  // UPDATE AFTER CLASS 23 Oct -> change to `req.body.user` instead
  var formData = req.body.user

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
    user => {
      // UPDATE 23 Oct
      // we won't handle this ourselves
      // we'll let passport handle this for us

      // res.redirect(`/profile/${user.slug}`)

      passport.authenticate('local', {
        successRedirect: '/'
      })(req, res);
    },
    // success flow, redirect to profile page
    err => res.send(err) // error flow
  )
})

module.exports = router
