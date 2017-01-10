var Volunteer = require('./models/volunteer');
var Organization = require('./models/organization');
var Auth = require('./models/auth');
var sha3_256 = require('js-sha3').sha3_256;
var csprng = require('csprng');
var _ = require('lodash');
var moment = require('moment');

module.exports = function(app) {
    app.get('/', function (req, res) {

    });

    app.get('/register', function(req, res) {
        res.redirect('/');
    });

    app.get('/admin', function(req, res) {
        res.redirect('/');
    });

    // Get Volunteer or Admin
    app.get('/vol/:email/:password', function(req, res) {
        var hash, salt;
        var response = {};
        // Retrieve auth credentials for organization
        Organization.find({name: 'UNTHSCPA'}, function(err, org){
            if (err) { res.send(err); }
            else if (org[0] === undefined) {
                res.status(404);
            } else {
                response.org = org[0];
                if(org[0].admin == req.params.email){
                    Auth.find({organization: 'UNTHSCPA', role: 'Admin'}, function(err, auth) {
                        if (err) {res.send(err); }
                        else {
                            hash = auth[0].password.hash;
                            salt = auth[0].password.salt;
                            if(sha3_256(salt + req.params.password) == hash) {
                                response.admin = true;
                                Volunteer.find({email: req.params.email}, function(err, vol){
                                    if (err) { res.send(err); }
                                    else if (vol[0] === undefined) {
                                        res.sendStatus(404);
                                    } else {
                                        response.vol = vol[0];
                                        res.send(response);
                                    }
                                });
                            } else {
                                res.sendStatus(401);
                            }
                        }
                    });
                } else {
                    Auth.find({organization: 'UNTHSCPA', role: 'Volunteer'}, function(err, auth) {
                        if (err) {res.send(err); }
                        else {
                            hash = auth[0].password.hash;
                            salt = auth[0].password.salt;
                            if(sha3_256(salt + req.params.password) == hash) {
                                Volunteer.find({email: req.params.email}, function(err, vol){
                                    if (err) { res.send(err); }
                                    else if (vol[0] === undefined) {
                                        res.sendStatus(404);
                                    } else {
                                        response.vol = vol[0];
                                        res.send(response);
                                    }
                                });
                            } else {
                                res.sendStatus(401);
                            }
                        }
                    });
                }
            }
        });
    });

    // Update Volunteer
    app.put('/vol/:password', function(req, res) {
        var vol = req.body.vol;
        var org = req.body.org;
        // Retrieve auth credentials for organization
        Auth.find({organization: org.name}, function(err, auth) {
            if (err) {res.send(err);}
            else {
                hash = auth[0].password.hash;
                salt = auth[0].password.salt;
                if(sha3_256(salt + req.params.password) == hash) {
                    // If authorized, update Volunteer
                    Volunteer.update({email: vol.email}, {datesAvailable: vol.datesAvailable}, function(err){
                        if(err) {res.send(err)}
                        else {
                            // If successful, update Organization
                            Organization.update({name: org.name}, {events: org.events}, function(err){
                                if(err) {res.send(err)}
                                else {
                                    res.send('Successfully updated.');
                                }
                            });
                        }
                    });
                } else {
                    res.sendStatus(401);
                }
            }
        })

    });

    // ADMIN - Add New Volunteer
    app.post('/admin/vol/:password', function(req, res){
        var newVolEmail = req.body.vol;
        var orgName = req.body.orgName;
        Auth.find({organization: orgName, role: 'Admin'}, function(err, auth){
            if (err) {res.send(err);}
            else {
                hash = auth[0].password.hash;
                salt = auth[0].password.salt;
                // Check Admin Credentials
                if(sha3_256(salt + req.params.password) == hash) {
                    var newVol = new Volunteer({email: newVolEmail,  organization: orgName,
                        cooldown: 0, datesAvailable: []})
                    // Save to Volunteer
                    newVol.save(function(err){
                        if (err) { res.send(err); }
                        else {
                            // Find Organization
                            Organization.find({name: orgName}, function(err, org){
                                if (err) { res.send(err); }
                                else {
                                    // Add New Volunteer to Organization
                                    org[0].volunteers.push(newVolEmail);
                                    // Update Organization
                                    Organization.update({name: orgName}, {volunteers: org[0].volunteers}, function(err){
                                        if (err) { res.send(err); }
                                        else {
                                            res.send(org);
                                        }
                                    })
                                }
                            });
                        }
                    });
                } else {
                    res.sendStatus(401);
                }
            }
        })
    });

    // ADMIN - Remove a Volunteer
    app.delete('/admin/vol/:password', function(req, res){
        var volToRemove = req.body.vol;
        var orgName = req.body.orgName;
        Auth.find({organization: orgName, role: 'Admin'}, function(err, auth){
            if (err) {res.send(err);}
            else {
                hash = auth[0].password.hash;
                salt = auth[0].password.salt;
                // Check Admin Credentials
                if(sha3_256(salt + req.params.password) == hash) {
                    Volunteer.remove({email: volToRemove}, function(err){
                        if (err) { res.send(err); }
                        else {
                            // Find Organization
                            Organization.find({name: orgName}, function(err, org){
                                if (err) { res.send(err); }
                                else {
                                    // Remove Volunteer from Organization
                                    _.remove(org[0].volunteers, function(v){return v == volToRemove});
                                    var newEvents = [];
                                    _.forEach(org[0].events, function(e){
                                       if (_.includes(e.volsAvailable, volToRemove)) {
                                           _.remove(e.volsAvailable, volToRemove);
                                       }
                                       newEvents.append(e);
                                    });
                                    // Update Organization
                                    Organization.update({name: orgName}, {volunteers: org[0].volunteers, events: newEvents}, function(err){
                                        if (err) { res.send(err); }
                                        else {
                                            res.send(org);
                                        }
                                    })
                                }
                            });
                        }
                    });
                } else {
                    res.sendStatus(401);
                }
            }
        })
    });

    // ADMIN - Add an Event
    app.post('/admin/event/:password', function(req, res){
        var newEventDate = moment(req.body.event).format('YYYY-MM-DD');
        var orgName = req.body.orgName;
        Auth.find({organization: orgName, role: 'Admin'}, function(err, auth){
            if (err) {res.send(err);}
            else {
                hash = auth[0].password.hash;
                salt = auth[0].password.salt;
                // Check Admin Credentials
                if(sha3_256(salt + req.params.password) == hash) {
                    Organization.find({name: orgName}, function(err, org){
                        if (err) { res.send(err); }
                        else {
                            // Add Event
                            var newEvent = {volsAvailable: [], date: newEventDate};
                            org[0].events.push(newEvent)
                            // Update Organization
                            Organization.update({name: orgName}, {events: org[0].events}, function(err){
                                if (err) { res.send(err); }
                                else {
                                    res.send(org);
                                }
                            })
                        }
                    });
                } else {
                    res.sendStatus(401);
                }
            }
        })
    });

    // ADMIN - Remove an Event
    app.delete('/admin/event/:password', function(req, res){
        var eventToRemove = req.body.event;
        var orgName = req.body.orgName;
        Auth.find({organization: orgName, role: 'Admin'}, function(err, auth){
            if (err) {res.send(err);}
            else {
                hash = auth[0].password.hash;
                salt = auth[0].password.salt;
                // Check Admin Credentials
                if(sha3_256(salt + req.params.password) == hash) {
                    Organization.find({name: orgName}, function(err, org){
                        if (err) { res.send(err); }
                        else {
                            // Remove Event from Organization
                            _.remove(org[0].events, function(e){return e.date == eventToRemove});
                            // Update Organization
                            Organization.update({name: orgName}, {events: org[0].events}, function(err){
                                if (err) { res.send(err); }
                                else {
                                    res.send(org);
                                }
                            })
                        }
                    });
                } else {
                    res.sendStatus(401);
                }
            }
        })
    });

    // ADMIN - Change Admin Email
    app.put('/admin/email/:password', function(req, res) {
        var newAdminEmail = req.body.newAdminEmail;
        var orgName = req.body.orgName;
        Auth.find({organization: orgName, role: 'Admin'}, function (err, auth) {
            if (err) {
                res.send(err);
            }
            else {
                hash = auth[0].password.hash;
                salt = auth[0].password.salt;
                // Check Admin Credentials
                if (sha3_256(salt + req.params.password) == hash) {
                    Organization.update({name: orgName}, {admin: newAdminEmail}, function (err) {
                        if (err) { res.send(err); }
                        else {
                            res.sendStatus(200);
                        }
                    });
                } else {
                    res.sendStatus(401);
                }
            }
        })
    });

    // ADMIN - Change Admin or Volunteer Password
    app.put('/admin/password/:password', function(req, res) {
        var newPassword = req.body.newPassword;
        var roleToChange = req.body.roleToChange;
        var orgName = req.body.orgName;
        Auth.find({organization: orgName, role: 'Admin'}, function (err, auth) {
            if (err) {
                res.send(err);
            }
            else {
                hash = auth[0].password.hash;
                salt = auth[0].password.salt;
                // Check Admin Credentials
                if (sha3_256(salt + req.params.password) == hash) {
                    var newSaltAndHash = {};
                    newSaltAndHash.salt = csprng(64,36);
                    newSaltAndHash.hash = sha3_256(newSaltAndHash.salt + newPassword);
                    Auth.update({organization: orgName, role: roleToChange}, {password: newSaltAndHash}, function (err) {
                        if (err) { res.send(err); }
                        else {
                            res.sendStatus(200);
                        }
                    });
                } else {
                    res.sendStatus(401);
                }
            }
        })
    });

    // ADMIN - Change Preferences
    app.put('/admin/pref/:password', function(req, res) {
        var pref = req.body.pref;
        var value = req.body.value;
        var orgName = req.body.orgName;
        Auth.find({organization: orgName, role: 'Admin'}, function (err, auth) {
            if (err) {
                res.send(err);
            }
            else {
                hash = auth[0].password.hash;
                salt = auth[0].password.salt;
                // Check Admin Credentials
                if (sha3_256(salt + req.params.password) == hash) {
                    Organization.find({name: orgName}, function(err, org){
                        if (err) { res.send(err); }
                        else {
                            _.update(org[0], 'preferences.' + pref, function(p) { return value;});
                            Organization.update({name: orgName}, {preferences: org[0].preferences}, function (err) {
                                if (err) { res.send(err); }
                                else {
                                    res.sendStatus(200);
                                }
                            });
                        }
                    });
                } else {
                    res.sendStatus(401);
                }
            }
        })
    });
}

