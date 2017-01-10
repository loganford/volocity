var Volunteer = require('./app/models/volunteer');
var Organization = require('./app/models/organization');
var nodemailer = require('nodemailer');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var _ = require('lodash');
var moment = require('moment');
// Config DB
var db = require('./config/db');

// DB Connection
mongoose.connect(db.url);

// Set up transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'volocity.scheduler@gmail.com',
        pass: '3hZa7LNRufdZ9Qy'
    }
});

Organization.find({name: 'UNTHSCPA'}, function(err, org){
    if (err) {console.log(err); }
    else {
        var events = org[0].events;
        var now = moment();
        var working = false;
        _.forEach(events, function(event) {
            if ((moment(event.date).diff(now, 'days') < 10 && moment(event.date).diff(now, 'days') > 0 &&
                event.assignedVols === undefined)) {
                working = true;
                var candidates = [];
                Volunteer.find({cooldown: 0, datesAvailable: event.date}, function(err, vols0) {
                    if (err) {console.log(err); process.exit();}
                    else {
                        candidates = vols0;
                        if (candidates.length < 2) {
                            Volunteer.find({cooldown: 1, datesAvailable: event.date}, function(err, vols1) {
                                if (err) {console.log(err); process.exit();}
                                else {
                                    candidates = candidates.concat(vols1);
                                    if (candidates.length < 2){
                                        Volunteer.find({cooldown: 2, datesAvailable: event.date}, function(err, vols2) {
                                            if (err) {console.log(err); process.exit();}
                                            else {
                                                candidates = candidates.concat(vols2);
                                                if (candidates.length < 2) {
                                                    alertAdmin(candidates, event, org[0].admin);
                                                } else {
                                                    selectCandidates(candidates, event, org[0]);
                                                }
                                            }
                                        });
                                    } else {
                                        selectCandidates(candidates, event, org[0]);
                                    }
                                }
                            });
                        } else {
                            selectCandidates(candidates, event, org[0]);
                        }
                    }
                });
                return false; // Break forEach as soon as a date is found
            }
        });
        if (!working) {
            process.exit();
        }
    }
});

function selectCandidates(candidates, event, org) {
    var vol1 = candidates[Math.floor(Math.random() * candidates.length)];
    _.remove(candidates, function(c) {return c.email == vol1.email})
    var vol2 = candidates[Math.floor(Math.random() * candidates.length)];
    if (vol1.cooldown != 2) {
        vol1.cooldown += 1;
        Volunteer.update({email: vol1.email}, {cooldown: vol1.cooldown}, function(err){
            if(err) {console.log(err);}
        });
    }
    if (vol2.cooldown != 2) {
        vol2.cooldown += 1;
        Volunteer.update({email: vol2.email}, {cooldown: vol2.cooldown}, function(err){
            if(err) {console.log(err);}
        });
    }
    _.forEach(org.events, function(e) {
       if (e.date == event.date) {
           console.log('assigned vols for date ' + e.date + ' are ' + vol1.email + ' and ' + vol2.email);
           e.assignedVols = [vol1.email, vol2.email];
       }
    });
    Organization.update({name: 'UNTHSCPA'}, {events: org.events}, function(err) {
        if (err) {console.log(err);}
    })
      Volunteer.update({email: {$nin: [vol1.email, vol2.email]}}, {cooldown: 0}, {multi: true}, function(err){
          if(err) {console.log(err);}
      });


    var subject = 'Volunteer Assignment for ' + moment(event.date).format('MMMM D');
    var msg =
        'Hi! The volunteers for ' + moment(event.date).format('MMMM D') + ' have been selected and e-mailed. \nTheir e-mail addresses are ' +
        vol1.email + ' and ' + vol2.email +'.';
    var mailOptions = {
        from: 'volocity.scheduler@gmail.com', // sender address
        to: org.admin, // list of receivers
        subject: subject, // Subject line
        text: msg //, // plaintext body
        //html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        };
    });

    var msg =
        'Hi! \n\nYou\'ve been selected to volunteer for the UNTHSC on ' + moment(event.date).format('MMMM D') +
            '. Please mark the date in your calendar. Send an email to ' + org.admin + ' if you have any questions. \n\nThanks! ';
    var mailOptions = {
        from: 'volocity.scheduler@gmail.com', // sender address
        // to: [vol1.email, vol2.email],
        to: ['loganford17@gmail.com'],
        subject: subject, // Subject line
        text: msg //, // plaintext body
        //html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
            process.exit();
        };
    });
}

function alertAdmin(candidates, event, admin) {
    var formattedDate = moment(event.date).format('MMMM D');
    var mailOptions = {
        from: 'volocity.scheduler@gmail.com', // sender address
        to: admin, // list of receivers
        subject: 'Insufficient Volunteers for ' + formattedDate, // Subject line
        text: 'Hi! \n\nThis is a notice to inform you that less than 2 volunteers have signed up to be scheduled for' + formattedDate +
            '. The database will be checked every 24 hours to check if others have signed up. \n\nThank you!'
        //html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        };
        process.exit();
    });

}