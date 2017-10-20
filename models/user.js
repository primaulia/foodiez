// requiring mongoose again
const mongoose = require('mongoose')
const Schema = mongoose.Schema // constructor for all schema

// UPDATE 20 Oct
// requiring bcrypt
const bcrypt = require('bcrypt')

// setting the blueprint of User object
const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  slug: String // new field for vanity url
})

// UPDATE 19 Oct, created pre-save hook for slug name
// http://mongoosejs.com/docs/middleware.html

// UPDATE 20 Oct, before we save the password, we hash it
// and save the hash instead
userSchema.pre('save', function(next) {
  var user = this
  // logic to create slug
  user.slug = user.name.toLowerCase().split(' ').join('-')

  // logic to create hash
  // Only hash the password if it has been modified (or is new)
  // if (!user.isModified('password')) return next();

  //hash the password
  bcrypt.hash(user.password, 10)
  .then(hash => { // the then method here is when we got the hash
    // UPDATE 20 OCT
    // call the next() when the password is hashed
    user.password = hash
    console.log('pre save flow', user)
    next() // next() is calling the save()
  })
})

// active the blueprint
// registering the name of the database that we're connecting to
const User = mongoose.model('User', userSchema)
// look for users collection in mDb
// we can name the object differently as to the DB registry

// need to export this
module.exports = User
