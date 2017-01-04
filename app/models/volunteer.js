var mongoose = require('mongoose');

module.exports = mongoose.model('Volunteer', {
    email : String,
    organization: String,
    cooldown: {type: Number, default: 0},
    datesAvailable: Array
});