// AFTER 20 Oct
// This page is where all the routes
// for /login goes
// be it POST, GET, or whatever

// NOTICE:
// NOT /admins/login BUT /login
// NOT adminData BUT userData
// NOT req.body.admin BUT req.body.user
// NOT admin.validPassword BUT user.validPassword
// NOT redirect to '/' if login is successful BUT to '/profile/:slug'

// require the model here
const User = require('../models/user')
const express = require('express')
const router = express.Router()

// need to require it again here, cos we need to use the passport strategies here
const passport = require('../config/ppConfig')

router.get('/', (req, res) => {
  // show the login form page
  // PITSTOP: when you're rendering, your POV is under `views`
  // no local data, cos we don't need to pass anything
  res.render('users/login')
})

// UPDATE 23 OCT. We're not gonna handle our login flow ourselves now
// we're gonna pass the logic to PASSPORT

// USER LOGIN FLOW - same like ADMIN LOGIN FLOW
// pseudocode
// - find user by email from form data
//  - if i cannot find the user, then redirect to login page too
    // (is in success flow)
// - compare the password with the hash password ???
// - if comparison is true, then user is authorized
//   - subsequent request, server should know that this is user
// - else, then redirect to login page
//   - tell them that their login is incorrect
// router.post('/', (req, res) => {
//   // return res.send(req.body)
//   const userData = req.body.user
//
//   User.findOne({
//     email: userData.email
//   })
//   .then(
//     user => {
//       // This is the success flow
//       // if you cannot find anything, user will be given
//       // as `null`
//       if (!user) {
//         console.log('user is null')
//         return res.redirect('/login')
//       }
//
//       // if you can find by the email
//       // we compare the password
//
//       // pass the comparison flow to the model
//       // we want to run a method called `validate`
//       // this fn name, can be anything
//       // two arguments the given password
//
//       // PITSTOP: `validPassword` function here is from `userSchema`
//       // check user.js at models folder
//       user.validPassword(userData.password, (err, valid) => {
//         // comparison failed here, if err is not null
//         if(! valid) {
//           console.log('comparison failed')
//           return res.redirect('/login')
//         }
//
//         // if output is true, redirect to homepage
//         console.log('comparison success');
//         res.redirect(`/profile/${user.slug}`)
//       })
//     },
//     err => res.send('error is found')
//   )
// })

// SPLIT RIGHT to `ppConfig.js` for better flow understanding
router.post('/', passport.authenticate('local', {
  successRedirect: '/', // the routes to go when it's successful
  failureRedirect: '/login' // the routes to go when it's not
}))

module.exports = router
