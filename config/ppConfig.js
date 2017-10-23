const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
// need to require `User` model here, so we can access the db
const User = require('../models/user')

passport.serializeUser(function(user,done){
  console.log('serializeUser')
  done(null, user.id) // this user with specific id. has logged in before
})

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user)
  })
})

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, function(email, password, done){
  User.findOne({email: email}, function(err, user){
    if(err) return done(err)
    if (!user) return done(null, false)
    user.validPassword(password, (err, isMatch) => {
      if (err) return done(err)
      if (isMatch) return done(null, user)
      return done(null, false, { message: 'mismatched'})
    })

  })
}))

module.exports = passport
