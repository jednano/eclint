var util = require('util');


Error.extend = function(options) {
    function Err(message) {
        this.message = message;
    }
    util.inherits(Err, Error);
    Err.prototype.name = options.name;
    return Err;
};

module.exports = Error;
