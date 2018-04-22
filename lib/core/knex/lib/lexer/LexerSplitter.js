'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var preg_quote = require('locutus/php/pcre/preg_quote');
var implode = require('locutus/php/strings/implode');

var _require = require('../bridge'),
    array = _require.array,
    preg_split = _require.preg_split,
    preg_match = _require.preg_match,
    string_set = _require.string_set,
    array_merge = _require.array_merge;

var LexerSplitter = function () {
	function LexerSplitter() {
		_classCallCheck(this, LexerSplitter);

		this.splitterPattern = this.convertSplittersToRegexPattern(LexerSplitter.splitters);
	}

	LexerSplitter.prototype.getSplittersRegexPattern = function getSplittersRegexPattern() {
		return this.splitterPattern;
	};

	LexerSplitter.prototype.convertSplittersToRegexPattern = function convertSplittersToRegexPattern(_splitters) {
		/*==========自动添加变量==========*/
		var _regex_parts = [];
		var _part = null;
		var _pattern = null;
		/*==============================*/

		_regex_parts = [];
		for (var __key in _splitters) {
			var _part = _splitters[__key];

			_part = preg_quote(_part);
			switch (_part) {
				case "\r\n":
					_part = "\\r\\n";
					break;
				case "\t":
					_part = "\\t";
					break;
				case "\n":
					_part = "\\n";
					break;
				case " ":
					_part = "\\s+";
					break;
				case "/":
					_part = "\\/";
					break;
				case "/\\*":
					_part = "\\/\\*";
					break;
				case "\\*/":
					_part = "\\*\\/";
					break;
			}
			_regex_parts = _regex_parts ? _regex_parts : [];
			_regex_parts.push(_part);
		}
		_pattern = implode("|", _regex_parts);
		return "/(" + _pattern + ")/";
	};

	return LexerSplitter;
}();

LexerSplitter.splitters = ["<=>", "\r\n", "!=", ">=", "<=", "<>", "<<", ">>", ":=", "\\", "&&", "||", ":=", "/*", "*/", "--", ">", "<", "|", "=", "^", "(", ")", "\t", "\n", "'", "\"", "`", ",", "@", " ", "+", "-", "*", "/", ";"];
module.exports = LexerSplitter;