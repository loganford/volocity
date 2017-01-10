var mongoose = require('mongoose');

module.exports = mongoose.model('Organization', {
    name : String,
    admin: String,
    preferences: Object,
    events: Array,
    volunteers: Array
});