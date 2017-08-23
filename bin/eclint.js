#!/usr/bin/env node
'use strict';
var cli = require('../dist/cli')(process.argv.slice(2));
module.exports = cli;
