var Volunteer = require('../app/models/volunteer');
var Organization = require('../app/models/organization');
var nodemailer = require('nodemailer');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var _ = require('lodash');
var moment = require('moment');
// Config DB
var db = require('../config/db');
var constants = require('../config/constants');
// DB Connection
mongoose.connect(db.url);

// Set up transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'volocity.scheduler@gmail.com',
        pass: 'RbXG6nDjrTqaqp7B'
    }
});

Organization.find({name: 'UNTHSCPA'}, function(err, org){
    if (err) {console.log(err); }
    else {
        var events = org[0].events;
        var now = moment();
        var working = false;
        var requiredNumOfCandidates = constants.numOfVolunteersToBeSelected;
        _.forEach(events, function(event) {
            if ((moment(event.date).diff(now, 'days') < 10 && moment(event.date).diff(now, 'days') > 0 &&
                event.assignedVols === undefined)) {
                working = true;
                var candidates = [];
                Volunteer.find({cooldown: 0, datesAvailable: event.date}, function(err, vols0) {
                    if (err) {console.log(err); process.exit();}
                    else {
                        candidates = vols0;
                        if (candidates.length < requiredNumOfCandidates) {
                            Volunteer.find({cooldown: 1, datesAvailable: event.date}, function(err, vols1) {
                                if (err) {console.log(err); process.exit();}
                                else {
                                    candidates = candidates.concat(vols1);
                                    if (candidates.length < requiredNumOfCandidates){
                                        Volunteer.find({cooldown: 2, datesAvailable: event.date}, function(err, vols2) {
                                            if (err) {console.log(err); process.exit();}
                                            else {
                                                candidates = candidates.concat(vols2);
                                                if (candidates.length < requiredNumOfCandidates) {
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
            var noWorkMsg =
                'No work needs to be done.';
            var adminMailOptions = {
                from: 'volocity.scheduler@gmail.com', // sender address
                to: 'loganford17@gmail.com', // list of receivers
                subject: 'Volocity Daily Check', // Subject line
                text: noWorkMsg //, // plaintext body
                //html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
            };
            transporter.sendMail(adminMailOptions, function(error, info){
                if(error){
                    console.log(error);
                } else {
                    console.log('Message sent: ' + info.response);
                    process.exit();
                }
            });
        }
    }
});

function selectCandidates(candidates, event, org) {

    var assignedVolunteers = [];
    var backups = [];

    _.forEach(_.range(0, constants.numOfVolunteersToBeSelected), function () {
        var vol = candidates[Math.floor(Math.random() * candidates.length)];
        _.remove(candidates, function(c) { return c.email == vol.email });
        assignedVolunteers.push(vol);
    });

    _.forEach(_.range(0, constants.numOfBackupsToBeSelected), function () {
        if (candidates.length >= 1) {
            var backup = candidates[Math.floor(Math.random() * candidates.length)];
            _.remove(candidates, function (c) {
                return c.email == backup.email
            });
            backups.push(backup);
        }
    });

    _.forEach(assignedVolunteers, function(v){
       if (v.cooldown != 2){
           v.cooldown += 1;
       }
       Volunteer.update({email: v.email}, {cooldown: v.cooldown}, function(err){
          if (err) { console.log(err); }
       });
    });

    _.map(org.events, function(e) {
        if (e.date == event.date) {
            e.assignedVols = _.map(assignedVolunteers, _.property('email'));
            e.backups = _.map(backups, _.property('email'));
        }
    });

    Organization.update({name: 'UNTHSCPA'}, {events: org.events}, function(err) {
        if (err) {console.log(err);}
    });

    Volunteer.update({email: {$nin: _.map(assignedVolunteers, _.property('email'))}}, {cooldown: 0}, {multi: true}, function(err){
      if(err) {console.log(err);}
    });

    var assignedEmails = '';
    var backupEmails = '';
    _.forEach(assignedVolunteers, function(av) {
       assignedEmails += av.email + '\n';
    });
    _.forEach(backups, function(b) {
        backupEmails += b.email + '\n';
    });

    var autoEmailMessage = '';
    var subject = 'Volunteer Assignment for ' + moment(event.date).format('MMMM D');

    if (org.preferences.autoEmail){
        autoEmailMessage = 'They have been automatically e-mailed.\n';
        var msg =
            'Hi! \n\nYou\'ve been selected to volunteer for the UNTHSC on ' + moment(event.date).format('MMMM D') +
            '. Please mark the date in your calendar.\n Send an email to ' + org.admin + ' if you have any questions. \n\nThanks! ';
        var mailOptions = {
            from: 'volocity.scheduler@gmail.com', // sender address
            to: [assignedVolunteers],
            // to: 'loganford17@gmail.com',
            subject: subject, // Subject line
            text: msg //, // plaintext body
            //html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });
    } else {
        autoEmailMessage = 'They have not been e-mailed.\n';
    }

    // E-mail admin and candidates
    var backupMessage;
    if(backups.length > 1){
        backupMessage = 'The backup volunteers are: \n\n' +
        backupEmails + '\n\n' +
        'Have a great day!';
    } else {
        backupMessage = 'No other volunteers were available to be backups for this date.' + '\n\n'
    }


    var adminMsg =
        'Hi! The volunteers for ' + moment(event.date).format('MMMM D') + ' have been selected. \n' +
        'Their e-mail addresses are listed below: \n\n' +
        assignedEmails + '\n' +
        autoEmailMessage +
        backupMessage +
        'Have a great day!';
    var adminMailOptions = {
        from: 'volocity.scheduler@gmail.com', // sender address
        to: [org.admin, 'loganford17@gmail.com'], // list of receivers
        subject: subject, // Subject line
        text: adminMsg //, // plaintext body
        //html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    };

    transporter.sendMail(adminMailOptions, function(error, info){
        if(error){
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
            process.exit();
        }
    });
}

function alertAdmin(candidates, event, admin) {
    var formattedDate = moment(event.date).format('MMMM D');
    var mailOptions = {
        from: 'volocity.scheduler@gmail.com', // sender address
        to: admin, // list of receivers
        subject: 'Insufficient Volunteers for ' + formattedDate, // Subject line
        text: 'Hi! \n\nThis is a notice to inform you that less than 4 volunteers have signed up to be scheduled for' + formattedDate +
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