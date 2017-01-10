var Volunteer = require('./app/models/volunteer');
var Organization = require('./app/models/organization');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var _ = require('lodash');
var moment = require('moment');
// Config DB
var db = require('./config/db');

// DB Connection
mongoose.connect(db.url);


Organization.find({name: 'UNTHSCPA'}, function(err, org){
    if (err) {console.log(err); }
    else {
        var events = org[0].events;
        var now = moment();
        var working = false;
        _.forEach(events, function(event) {
            // Remove all events past 60 days
            if ((moment(now).diff(event.date, 'days') >= 60)) {
                working = true;
                _.remove(events, function(e) {return e.date == event.date});
            }
        });
        Organization.update({name: 'UNTHSCPA'}, {events: events}, function(err){
            if (err) { console.log(err); process.exit();}
            else {
                process.exit();
            }
        });
        if (!working) {
            process.exit();
        }
    }
});