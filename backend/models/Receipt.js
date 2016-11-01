var
  mongoose = require('mongoose'),
  receiptSchema = new mongoose.Schema({
    name: String,
    owes: Number,
    avatar: String,
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  })

var Receipt = mongoose.model('Receipt', receiptSchema)

module.exports = Receipt
