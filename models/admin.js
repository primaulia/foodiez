// UPDATE 20 Oct
// New model => ADMIN

const mongoose = require('mongoose')
const Schema = mongoose.Schema // constructor for all schema
const bcrypt = require('bcrypt')

const adminSchema = new Schema({
  name: String,
  email: String,
  password: String
})

// UPDATE 20 Oct, before we save the password, we hash it
// and save the hash instead
adminSchema.pre('save', function (next) {
  var admin = this
  // no need slug for admin
  // user.slug = user.name.toLowerCase().split(' ').join('-')

  // logic to create hash
  // hash the password
  bcrypt.hash(admin.password, 10)
  .then(hash => {
    // UPDATE 20 OCT
    // the then method here is when we got the hash
    // call the next() when the password is hashed
    admin.password = hash
    console.log(`admin saved to db is ${admin}`);
    next() // next() is calling the save()
  })
})

// UPDATE 20 Oct, create first instance method
// - use bcrypt to compare plainPassword
// - with hashed password
adminSchema.methods.validPassword = function (plainPassword, callback) {
  bcrypt.compare(plainPassword, this.password, callback)
}

// activate the blueprint
const Admin = mongoose.model('Admin', adminSchema)

// need to export this
module.exports = Admin
