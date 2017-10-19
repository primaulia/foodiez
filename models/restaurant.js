// what is this file for? I'll explain on thursday
// for the curious read here https://jeremiahalex.gitbooks.io/wdi-sg/content/05-express/express-mongoose/readme.html

// we need to initiate mongoose again here, because technically
// we don't run our node here, we run our node in index.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema // http://mongoosejs.com/docs/guide.html

// create a schema
// remember your ERD, this is where the diagram is your help to write the code
const restaurantSchema = new Schema({
  // <fields name>: <type> OR

  // <fields name>: {
  //   type: <type>,
  //   other stuff I'll explain
  // }

  // compare the structure here with your restaurants data

  address: {
    building: String,
    coord: Array,
    street: String,
    zipcode: String
  },
  borough: String,
  cuisine: String,
  grades: [{
    date: Date,
    grade: String,
    score: Number
  }],
  name: String,
  // slug: String,
  restaurant_id: String,
  // 19 Oct. update restaurants to have `owner` fields too, ref: User
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

// Think that the line below here
// is like when you're building a blueprint with `restaurantSchema`
// and you're now creating an object based on that blueprint
const Restaurant = mongoose.model('Restaurant', restaurantSchema)

// make this available to our other files
// remember that technically we're only running index.js
module.exports = Restaurant
