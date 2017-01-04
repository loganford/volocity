var Volunteer = require('./models/volunteer');
var Organization = require('./models/organization');
var Auth = require('./models/Auth');
var sha3_256 = require('js-sha3').sha3_256;
var csprng = require('csprng');
var _ = require('lodash');

module.exports = function(app) {
    app.get('/', function (req, res) {

    });

    app.get('/register', function(req, res) {
        res.redirect('/');
    });

    app.get('/admin', function(req, res) {
        res.redirect('/');
    });

    app.get('/vol/:email/:passcode', function(req, res) {
        var hash, salt;
        var response = {};
        // Retrieve auth credentials for organization
        Auth.find({organization: 'UNTHSCPA'}, function(err, auth){
            if (err) {res.send(err); }
            else {
                hash = auth[0].passcode.hash;
                salt = auth[0].passcode.salt;
                if(sha3_256(salt + req.params.passcode) == hash) {
                    // If authorized, retrieve organization data
                    Organization.find({name: 'UNTHSCPA'}, function(err, org){
                        if (err) { res.send(err); }
                        else if (org[0] === undefined) {
                            res.status(403);
                        } else {
                            // Append organization to response
                            response.org = org[0];
                            // Retrieve volunteer
                            Volunteer.find({email: req.params.email}, function(err, vol){
                                if (err) { res.send(err); }
                                else if (vol[0] === undefined) {
                                    var newVol = new Volunteer({email: req.params.email,  organization: response.org.name,
                                        cooldown: 0, datesAvailable: []})
                                    newVol.save(function(err){
                                        if (err) {console.log(err);}
                                        else {
                                            response.vol = newVol;
                                            console.log('New Volunteer was added to ' + response.org.name +': ' + newVol);
                                            res.send(response);
                                        }
                                    });
                                } else {
                                    response.vol = vol[0];
                                    res.send(response);
                                }
                            });

                        }
                    });
                } else {
                    res.sendStatus(401);
                }
            }
        });

        app.put('/vol/:passcode', function(req, res) {
            var vol = req.body.vol;
            var org = req.body.org;
            // Retrieve auth credentials for organization
            Auth.find({organization: org.name}, function(err, auth) {
                if (err) {res.send(err);}
                else {
                    hash = auth[0].passcode.hash;
                    salt = auth[0].passcode.salt;
                    if(sha3_256(salt + req.params.passcode) == hash) {
                        // If authorized, updated Volunteer
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
    });
}

