// UPDATE 20 Oct
// New model => ADMIN
// This is pretty much the same like how `User` model works

// NOTICE
// NOT `userSchema` but `adminSchema`
// NOT `user.password` but `admin.password`

const mongoose = require('mongoose')
const Schema = mongoose.Schema // constructor for all schema
const bcrypt = require('bcrypt')

const adminSchema = new Schema({
  name: String,
  email: String,
  password: String
})

adminSchema.pre('save', function (next) {
  var admin = this
  // no need slug for `Admin` model
  // user.slug = user.name.toLowerCase().split(' ').join('-')

  bcrypt.hash(admin.password, 10)
  .then(hash => {
    admin.password = hash
    console.log(`admin saved to db is ${admin}`);
    next()
  })
})

// UPDATE 20 Oct, create first instance method
// PSEUDOCODE
// - use bcrypt to compare plainPassword
// - with hashed password
adminSchema.methods.validPassword = function (plainPassword, callback) {
  bcrypt.compare(plainPassword, this.password, callback)
  // the `callback` will receive two arguments
  // (<error object, if any>, <true/false>)
}

// activate the blueprint
const Admin = mongoose.model('Admin', adminSchema)

// need to export this
module.exports = Admin
