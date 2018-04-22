'use strict';

var helper = require('./index');
var path = require('path');

module.exports = function (dir, ext) {
    var ragexp = new RegExp('\\.' + ext + '$');
    var files = helper.getdirFiles(dir).filter(function (file) {
        return ragexp.test(file);
    });
    var cache = {};
    files.forEach(function (file) {
        var name = file.replace(/\\/g, '/').replace(ragexp, '');
        var filepath = path.join(dir, file);
        cache[name] = filepath;
    });
    return cache;
};