var mongoose = require('mongoose');

module.exports = mongoose.model('Auth', {
    organization : String,
    role: String,
    password: {
        salt: String,
        hash: String
    }
});