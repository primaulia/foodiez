// requiring mongoose again
const mongoose = require('mongoose')
const Schema = mongoose.Schema // constructor for all schema

// setting the blueprint of Review object
const reviewSchema = new Schema({
  title: String,
  description: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  } // to make a more comprehensive schema, we need to provide an object
})

// activate the blueprint
// registering the name of the database that we're connecting to
const Review = mongoose.model('Review', reviewSchema)
// look for `reviews` collection in mDb
// we can name the object differently as to the DB registry


// need to export this
module.exports = Review
