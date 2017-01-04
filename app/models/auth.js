var mongoose = require('mongoose');

module.exports = mongoose.model('Auth', {
    organization : String,
    passcode: {
        salt: String,
        hash: String
    }
});