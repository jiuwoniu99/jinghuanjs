'use strict';

var text = require('./text.js');
var helper = require('../helper');
var parseString = require('xml2js').parseString;
var parser = helper.promisify(parseString, parseString);

module.exports = function (ctx, opts) {
  return text(ctx, opts).then(parser).then(function (data) {
    return { post: data };
  });
};