var express = require('express');
var bodyParser = require('body-parser');
var sha3_256 = require('js-sha3').sha3_256;
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var csprng = require('csprng');
var _ = require('lodash');
var app = express();

app.use('/unthscpa', express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//DB Connection
mongoose.connect('mongodb://heroku_f913h3ph:e91uvbodmgahapl69rmthff1pg@ds119788.mlab.com:19788/heroku_f913h3ph');

//DB Schema - Volunteer
var volunteerSchema = new mongoose.Schema({
  email: String,
  datesAvailable: Array,
});

var organizationSchema = new mongoose.Schema({
    name: String,
    email: String,
    passcode: {
        salt: String,
        hash: String
    }
})

//DB Schema - Event
var eventSchema = new mongoose.Schema({
  date: Date,
  availableVols: Array
});

// Create a model based on the schema
var Volunteer = mongoose.model('Volunteer', volunteerSchema);
var Event = mongoose.model('Event', eventSchema);
var Organization = mongoose.model('Organization', organizationSchema);

// var mySalt = csprng(64,36);
// var myHash = sha3_256(mySalt + 'PAVOLS2017');
// var unthscpa = new Organization({name: 'UNTHSCPA', email: 'loganford17@gmail.com', passcode: {hash: myHash, salt: mySalt}})
//
//
// unthscpa.save(function(err){
//     if(err)
//         console.log(err);
//     else
//         console.log(unthscpa);
// });

//Initialize App
app.listen(process.env.PORT || 3000, function () {
    console.log("App is now live!");
});

//Endpoints
app.get('/', function (req, res) {
  res.redirect('/unthscpa');
});

app.get('/vol/:email/:passcode', function(req, res) {
    console.log('GET Vol Received');
    console.log(req.params);
    var hash, salt;
    Organization.find({name: 'UNTHSCPA'}, function(err, org){
        if (err) { res.send(err); }
        else {
            hash = org[0].passcode.hash;
            salt = org[0].passcode.salt;
            if(sha3_256(salt + req.params.passcode) == hash) {
                Volunteer.find({email: req.params.email}, function(err, vol){
                    if (err) { res.send(err); }
                    else { res.send(vol); }
                });
            } else {
                res.send('FAIL');
            }
        }
    });
});