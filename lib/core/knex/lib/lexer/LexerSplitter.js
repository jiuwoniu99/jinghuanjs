const preg_quote = require('locutus/php/pcre/preg_quote');
const implode = require('locutus/php/strings/implode');
const {array, preg_split, preg_match, string_set, array_merge} = require('../bridge');

class LexerSplitter {
	constructor() {
		this.splitterPattern = this.convertSplittersToRegexPattern(LexerSplitter.splitters);
	}
	
	getSplittersRegexPattern() {
		return this.splitterPattern;
	}
	
	convertSplittersToRegexPattern(_splitters) {
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
					_part = "\\s";
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
	}
}

LexerSplitter.splitters = ["<=>", "\r\n", "!=", ">=", "<=", "<>", "<<", ">>", ":=", "\\", "&&", "||", ":=", "/*", "*/", "--", ">", "<", "|", "=", "^", "(", ")", "\t", "\n", "'", "\"", "`", ",", "@", " ", "+", "-", "*", "/", ";"];
module.exports = LexerSplitter;