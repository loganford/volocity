var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var app = express();
var methodOverride = require('method-override');

// Config DB
var db = require('./config/db');

app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Angular Routes
require('./app/routes')(app); // configure our routes

// DB Connection
mongoose.connect(db.url);

//Initialize App
app.listen(process.env.PORT || 3000, function () {
    console.log("App is live!");
});

exports = module.exports = app;