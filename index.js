var express = require('express');
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var mongoose = require('mongoose');
var app = express();

app.use('/unthscpa', express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use(bodyParser.json());
mongoose.connect('mongodb://heroku_f913h3ph:e91uvbodmgahapl69rmthff1pg@ds119788.mlab.com:19788/heroku_f913h3ph');

var volunteerSchema = new mongoose.Schema({
  email: String,
  datesAvailable: Array,
});

var callback = function (err, data) {
  if (err) { return console.error(err); }
  else { console.log(data); }
}

// Create a model based on the schema
var Volunteer = mongoose.model('Volunteer', volunteerSchema);


// Volunteer.remove({email: 'loganford17@gmail.com'}, callback);
// Volunteer.remove({email: 'charis@gmail.com'}, callback);

// var logan = new Volunteer({email: 'loganford17@gmail.com', datesAvailable: ['20170122', '20170208']});
// var charis = new Volunteer({email: 'charis@gmail.com', datesAvailable: ['20170122', '20170315', '20170421']});
//
// // Save it to database
// logan.save(function(err){
//   if(err)
//     console.log(err);
//   else
//     console.log(logan);
// });
//
// charis.save(function(err){
//   if(err)
//     console.log(err);
//   else
//     console.log(charis);
// });

// // Create a database variable outside of the database connection callback to reuse the connection pool in your app.
// var db;
//
// // Connect to the database before starting the application server.
// mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
//   if (err) {
//     console.log(err);
//     process.exit(1);
//   }
//
//   // Save database object from the callback for reuse.
//   db = database;
//   console.log("Database connection ready");
//
//   // Initialize the app.
//   var server = app.listen(process.env.PORT || 3000, function () {
//     var port = server.address().port;
//     console.log("App now running on port", port);
//   });
// });


app.listen(process.env.PORT || 3000, function () {
    console.log("App is now live!");
});

//Endpoints
app.get('/', function (req, res) {
  res.redirect('/unthscpa')
})