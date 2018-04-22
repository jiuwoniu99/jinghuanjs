'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var strlen = require('locutus/php/strings/strlen');
var substr = require('locutus/php/strings/substr');
var is_string = require('locutus/php/var/is_string');
var count = require('locutus/php/array/count');
var is_numeric = require('locutus/php/var/is_numeric');
var array_values = require('locutus/php/array/array_values');
var strtoupper = require('locutus/php/strings/strtoupper');

var _require = require('../bridge'),
    preg_split = _require.preg_split;

var JSSQLLexer = function () {
	function JSSQLLexer() {
		_classCallCheck(this, JSSQLLexer);

		this.splitters = new (require('./LexerSplitter'))();
	}

	JSSQLLexer.prototype.endsWith = function endsWith(_haystack, _needle) {
		/*==========自动添加变量==========*/
		var _length = null;
		/*==============================*/

		_length = strlen(_needle);
		if (_length == 0) {
			return true;
		}
		return substr(_haystack, -_length) === _needle;
	};

	JSSQLLexer.prototype.split = function split(_sql) {
		/*==========自动添加变量==========*/
		var _tokens = null;
		/*==============================*/

		if (!is_string(_sql)) {
			throw new Error("no SQL string to parse: \n" + _sql);
		}
		_tokens = preg_split(this.splitters.getSplittersRegexPattern(), _sql, null, "PREG_SPLIT_DELIM_CAPTURE" | "PREG_SPLIT_NO_EMPTY");
		_tokens = this.concatComments(_tokens);
		_tokens = this.concatEscapeSequences(_tokens);
		_tokens = this.balanceBackticks(_tokens);
		_tokens = this.concatColReferences(_tokens);
		_tokens = this.balanceParenthesis(_tokens);
		_tokens = this.concatUserDefinedVariables(_tokens);
		_tokens = this.concatScientificNotations(_tokens);
		_tokens = this.concatNegativeNumbers(_tokens);
		return _tokens;
	};

	JSSQLLexer.prototype.concatNegativeNumbers = function concatNegativeNumbers(_tokens) {
		/*==========自动添加变量==========*/
		var _i = null;
		var _cnt = null;
		var _possibleSign = null;
		var _token = null;
		/*==============================*/

		_i = 0;
		_cnt = count(_tokens);
		_possibleSign = true;
		while (_i < _cnt) {
			if (!_tokens[_i]) {
				_i++;
				continue;
			}
			_token = _tokens[_i];
			if (_possibleSign === true) {
				if (_token === "-" || _token === "+") {
					if (is_numeric(_tokens[_i + 1])) {
						_tokens[_i + 1] = _token + _tokens[_i + 1];
						delete _tokens[_i];
					}
				}
				_possibleSign = false;
				continue;
			}
			if (substr(_token, -1, 1) === "," || substr(_token, -1, 1) === "(") {
				_possibleSign = true;
			}
			_i++;
		}
		return array_values(_tokens);
	};

	JSSQLLexer.prototype.concatScientificNotations = function concatScientificNotations(_tokens) {
		/*==========自动添加变量==========*/
		var _i = null;
		var _cnt = null;
		var _scientific = null;
		var _token = null;
		/*==============================*/

		_i = 0;
		_cnt = count(_tokens);
		_scientific = false;
		while (_i < _cnt) {
			if (!_tokens[_i]) {
				_i++;
				continue;
			}
			_token = _tokens[_i];
			if (_scientific === true) {
				if (_token === "-" || _token === "+") {
					_tokens[_i - 1] += _tokens[_i];
					_tokens[_i - 1] += _tokens[_i + 1];
					delete _tokens[_i];
					delete _tokens[_i + 1];
				} else if (is_numeric(_token)) {
					_tokens[_i - 1] += _tokens[_i];
					delete _tokens[_i];
				}
				_scientific = false;
				continue;
			}
			if (strtoupper(substr(_token, -1, 1)) === "E") {
				_scientific = is_numeric(substr(_token, 0, -1));
			}
			_i++;
		}
		return array_values(_tokens);
	};

	JSSQLLexer.prototype.concatUserDefinedVariables = function concatUserDefinedVariables(_tokens) {
		/*==========自动添加变量==========*/
		var _i = null;
		var _cnt = null;
		var _userdef = null;
		var _token = null;
		/*==============================*/

		_i = 0;
		_cnt = count(_tokens);
		_userdef = false;
		while (_i < _cnt) {
			if (!_tokens[_i]) {
				_i++;
				continue;
			}
			_token = _tokens[_i];
			if (_userdef !== false) {
				_tokens[_userdef] += _token;
				delete _tokens[_i];
				if (_token !== "@") {
					_userdef = false;
				}
			}
			if (_userdef === false && _token === "@") {
				_userdef = _i;
			}
			_i++;
		}
		return array_values(_tokens);
	};

	JSSQLLexer.prototype.concatComments = function concatComments(_tokens) {
		/*==========自动添加变量==========*/
		var _i = null;
		var _cnt = null;
		var _comment = null;
		var _token = null;
		var _inline = null;
		/*==============================*/

		_i = 0;
		_cnt = count(_tokens);
		_comment = false;
		while (_i < _cnt) {
			if (!_tokens[_i]) {
				_i++;
				continue;
			}
			_token = _tokens[_i];
			if (_comment !== false) {
				if (_inline === true && (_token === "\n" || _token === "\r\n")) {
					_comment = false;
				} else {
					delete _tokens[_i];
					_tokens[_comment] += _token;
				}
				if (_inline === false && _token === "*/") {
					_comment = false;
				}
			}
			if (_comment === false && _token === "--") {
				_comment = _i;
				_inline = true;
			}
			if (_comment === false && substr(_token, 0, 1) === "#") {
				_comment = _i;
				_inline = true;
			}
			if (_comment === false && _token === "/*") {
				_comment = _i;
				_inline = false;
			}
			_i++;
		}
		return array_values(_tokens);
	};

	JSSQLLexer.prototype.isBacktick = function isBacktick(_token) {
		return _token === "'" || _token === "\"" || _token === "`";
	};

	JSSQLLexer.prototype.balanceBackticks = function balanceBackticks(_tokens) {
		/*==========自动添加变量==========*/
		var _i = null;
		var _cnt = null;
		var _token = null;
		/*==============================*/

		_i = 0;
		_cnt = count(_tokens);
		while (_i < _cnt) {
			if (!_tokens[_i]) {
				_i++;
				continue;
			}
			_token = _tokens[_i];
			if (this.isBacktick(_token)) {
				_tokens = this.balanceCharacter(_tokens, _i, _token);
			}
			_i++;
		}
		return _tokens;
	};

	JSSQLLexer.prototype.balanceCharacter = function balanceCharacter(_tokens, _idx, _char) {
		/*==========自动添加变量==========*/
		var _token_count = null;
		var _i = null;
		var _token = null;
		/*==============================*/

		_token_count = count(_tokens);
		_i = _idx + 1;
		while (_i < _token_count) {
			if (!_tokens[_i]) {
				_i++;
				continue;
			}
			_token = _tokens[_i];
			_tokens[_idx] += _token;
			delete _tokens[_i];
			if (_token === _char) {
				break;
			}
			_i++;
		}
		return array_values(_tokens);
	};

	JSSQLLexer.prototype.concatColReferences = function concatColReferences(_tokens) {
		/*==========自动添加变量==========*/
		var _cnt = null;
		var _i = null;
		var _k = null;
		var _len = null;
		/*==============================*/

		_cnt = count(_tokens);
		_i = 0;
		while (_i < _cnt) {
			if (!_tokens[_i]) {
				_i++;
				continue;
			}
			if (_tokens[_i][0] === ".") {
				_k = _i - 1;
				_len = strlen(_tokens[_i]);
				while (_k >= 0 && _len == strlen(_tokens[_i])) {
					if (!_tokens[_k]) {
						_k--;
						continue;
					}
					_tokens[_i] = _tokens[_k] + _tokens[_i];
					delete _tokens[_k];
					_k--;
				}
			}
			if (this.endsWith(_tokens[_i], ".") && !is_numeric(_tokens[_i])) {
				_k = _i + 1;
				_len = strlen(_tokens[_i]);
				while (_k < _cnt && _len == strlen(_tokens[_i])) {
					if (!_tokens[_k]) {
						_k++;
						continue;
					}
					_tokens[_i] += _tokens[_k];
					delete _tokens[_k];
					_k++;
				}
			}
			_i++;
		}
		return array_values(_tokens);
	};

	JSSQLLexer.prototype.concatEscapeSequences = function concatEscapeSequences(_tokens) {
		/*==========自动添加变量==========*/
		var _tokenCount = null;
		var _i = null;
		/*==============================*/

		_tokenCount = count(_tokens);
		_i = 0;
		while (_i < _tokenCount) {
			if (this.endsWith(_tokens[_i], "\\")) {
				_i++;
				if (_tokens[_i]) {
					_tokens[_i - 1] += _tokens[_i];
					delete _tokens[_i];
				}
			}
			_i++;
		}
		return array_values(_tokens);
	};

	JSSQLLexer.prototype.balanceParenthesis = function balanceParenthesis(_tokens) {
		/*==========自动添加变量==========*/
		var _token_count = null;
		var _i = null;
		var _count = null;
		var _n = null;
		var _token = null;
		/*==============================*/

		_token_count = count(_tokens);
		_i = 0;
		while (_i < _token_count) {
			if (_tokens[_i] !== "(") {
				_i++;
				continue;
			}
			_count = 1;
			for (_n = _i + 1; _n < _token_count; _n++) {
				_token = _tokens[_n];
				if (_token === "(") {
					_count++;
				}
				if (_token === ")") {
					_count--;
				}
				_tokens[_i] += _token;
				delete _tokens[_n];
				if (_count === 0) {
					_n++;
					break;
				}
			}
			_i = _n;
		}
		return array_values(_tokens);
	};

	return JSSQLLexer;
}();

module.exports = JSSQLLexer;