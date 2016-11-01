var mongoose = require('mongoose')
var Schema = mongoose.Schema
// var passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
  username: String,
  password: String,
  receipts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Receipt'}]
})

// User.plugin(passportLocalMongoose)


module.exports = mongoose.model('User', User)
