// UPDATE 20 Oct
// This page is where all the routes
// for /admin goes
// be it POST, GET, or whatever

// require the model here
const Admin = require('../models/admin')
const express = require('express')
const router = express.Router()
const adminCode = '42admin'

router.get('/register', (req, res) => {
  res.render('admins/register')
})
router.post('/register', (req, res) => {
  // res.send(req.body) // DONT FORGET, ONE REQ = ONE RESPONSE

  // UPDATE 20 Oct
  // use the form data => check the `admin/register.handlebars`
  var adminData = req.body.admin

  // CHECK if adminData.code === adminCode
  // redirect to error page
  // TODO: redirect to an actual page
  if (adminData.code !== adminCode)
    // if it's wrong flow, MUST call `return`
  {
    console.log('test')
    return res.send('error page instead')
  }

  var newAdmin = new Admin({
    name: adminData.name,
    email: adminData.email,
    password: adminData.password // NOTICE, we're going to update this
  })

  // res.send(newAdmin)

  newAdmin.save() // save the object that was created
  .then(
    admin => res.send(admin)
  )
  .catch(
    err => res.send(err)
  )
})

router.get('/login', (req, res) => {
  // show the login form page
  // PITSTOP: when you're rendering, your POV is under `views`
  // no local data, cos we don't need to pass anything
  res.render('admins/login')
})

// ADMIN LOGIN FLOW
// pseudocode
// - find admin by email from form data
//  - if i cannot find the admin, then redirect to login page too
    // (is in success flow)
// - compare the password with the hash password ???
// - if comparison is true, then admin is authorized
//   - subsequent request, server should know that this is admin
// - else, then redirect to login page
//   - tell them that their login is incorrect
router.post('/login', (req, res) => {
  // return res.send(req.body)
  const adminData = req.body.admin

  Admin.findOne({
    email: adminData.email
  })
  .then(
    admin => {
      // This is the success flow
      // if you cannot find anything, admin will be given
      // as `null`
      if (!admin) {
        console.log('admin is null')
        return res.redirect('/admin/login')
      }

      // if you can find by the email
      // we compare the password

      // pass the comparison flow to the model
      // we want to run a method called `validate`
      // this fn name, can be anything
      // two arguments the given password

      // PITSTOP: `validPassword` function here is from `adminSchema`
      // check admin.js at models folder
      admin.validPassword(adminData.password, (err, valid) => {
        // comparison failed here, if err is not null
        if(! valid) {
          console.log('comparison failed')
          return res.redirect('/admin/login')
        }

        // if output is true, redirect to homepage
        console.log('comparison success');
        res.redirect('/')
      })
    },
    err => res.send('error is found')
  )
})

module.exports = router
