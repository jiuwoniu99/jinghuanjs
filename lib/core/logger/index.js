'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = require('assert');
var BasicAdapter = require('./adapter/base');
var ConsoleAdapter = require('./adapter/console');
var FileAdapter = require('./adapter/file');
var DateFileAdapter = require('./adapter/datefile');

var Logger = function Logger() {
	var _this = this;

	var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	_classCallCheck(this, Logger);

	var Handle = config.handle || ConsoleAdapter;
	delete config.handle;

	this._logger = new Handle(config);
	['debug', 'info', 'warn', 'error'].forEach(function (level) {
		assert(_this._logger[level], 'adapter function ' + level + ' not exist!');
		_this[level] = _this._logger[level].bind(_this._logger);
	});
};

Logger.Basic = BasicAdapter;
Logger.Console = ConsoleAdapter;
Logger.File = FileAdapter;
Logger.DateFile = DateFileAdapter;
module.exports = Logger;