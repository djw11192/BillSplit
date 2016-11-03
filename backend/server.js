var
  express = require('express'),
  app = express(),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser')

  app.use(bodyParser.json())

  mongoose.connect('mongodb://localhost/billsplit', function(err) {
    if(err) return console.log(err)
    console.log("Connected to MongoDB")
  })

  app.listen(3000, function(err){
    console.log("Server running on 3000")
  })
