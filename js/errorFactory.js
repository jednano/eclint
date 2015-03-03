var util = require('util');
function create(options) {
    function Err(message) {
        this.message = message;
    }
    util.inherits(Err, Error);
    Err.prototype.name = options.name;
    return Err;
}
exports.create = create;
