var Line = require('../../../lib/Line');
var rule = require('../../../lib/rules/charset');


describe('charset rule', function() {

    var settings = {};
    var charsets = [
        'latin1',
        'utf-8',
        'utf-8-bom',
        'utf-16be',
        'utf-16le',
        'utf-32le',
        'utf-32be'
    ];

    charsets.forEach(function(setting) {
        settings[setting] = { charset: setting };
    });

    beforeEach(function() {
        reporter.reset();
    });

    describe.skip('check command', function() {

    });

    describe.skip('fix command', function() {

    });

    describe.skip('infer command', function() {

    });

});
