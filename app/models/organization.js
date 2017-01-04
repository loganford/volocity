var mongoose = require('mongoose');

module.exports = mongoose.model('Organization', {
    name : String,
    admin: String,
    events: Array,
    volunteers: Array
});