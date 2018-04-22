'use strict';

var path = require('path');
var debug = require('debug')('JH:core/loader/sql[' + process.pid + ']');
var helper = require('../helper');
var fs = require('fs');

/**
 *
 * @param dir
 * @return {{}}
 */
var loadFiles = function loadFiles(dir) {
	var files = helper.getdirFiles(dir).filter(function (file) {
		return (/\.sql/.test(file)
		);
	});
	var cache = {};
	files.forEach(function (file) {
		var name = file.replace(/\\/g, '/').replace(/\.sql$/, '');
		var filepath = path.join(dir, file);
		debug('load file: ' + filepath);
		cache[name] = fs.readFileSync(filepath, "utf-8");
	});
	return cache;
};

/**
 * load sql
 */
module.exports = function load(appPath, modules) {
	var cache = {};
	modules.forEach(function (item) {
		cache[item] = {};
		var itemCache = loadFiles(path.join(appPath, item, 'sql'));
		for (var name in itemCache) {
			cache[item][name] = itemCache[name];
		}
	});
	return cache;
};