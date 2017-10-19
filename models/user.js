// requiring mongoose again
const mongoose = require('mongoose')
const Schema = mongoose.Schema // constructor for all schema

// setting the blueprint of User object
const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  slug: String // new field for vanity url
})

// UPDATE 19 Oct, created pre-save hook for slug name
// http://mongoosejs.com/docs/middleware.html
userSchema.pre('save', function(next) {
  var user = this
  // logic to create slug
  user.slug = user.name.toLowerCase().split(' ').join('-')

  console.log('pre save flow', user)
  next()
})

// active the blueprint
// registering the name of the database that we're connecting to
const User = mongoose.model('User', userSchema)
// look for users collection in mDb
// we can name the object differently as to the DB registry

// need to export this
module.exports = User
