"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _strlen = require("locutus/php/strings/strlen");

var _strlen2 = _interopRequireDefault(_strlen);

var _substr = require("locutus/php/strings/substr");

var _substr2 = _interopRequireDefault(_substr);

var _is_string = require("locutus/php/var/is_string");

var _is_string2 = _interopRequireDefault(_is_string);

var _count2 = require("locutus/php/array/count");

var _count3 = _interopRequireDefault(_count2);

var _is_numeric = require("locutus/php/var/is_numeric");

var _is_numeric2 = _interopRequireDefault(_is_numeric);

var _array_values = require("locutus/php/array/array_values");

var _array_values2 = _interopRequireDefault(_array_values);

var _strtoupper = require("locutus/php/strings/strtoupper");

var _strtoupper2 = _interopRequireDefault(_strtoupper);

var _LexerSplitter = require("./LexerSplitter");

var _LexerSplitter2 = _interopRequireDefault(_LexerSplitter);

var _bridge = require("../bridge.js");

var _bridge2 = _interopRequireDefault(_bridge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let JSSQLLexer = class JSSQLLexer {
    constructor() {
        this.splitters = new _LexerSplitter2.default();
    }

    endsWith(_haystack, _needle) {
        var _length = null;


        _length = (0, _strlen2.default)(_needle);
        if (_length == 0) {
            return true;
        }
        return (0, _substr2.default)(_haystack, -_length) === _needle;
    }

    split(_sql) {
        var _tokens = null;


        if (!(0, _is_string2.default)(_sql)) {
            throw new Error("no SQL string to parse: \n" + _sql);
        }
        _tokens = _bridge2.default.preg_split(this.splitters.getSplittersRegexPattern(), _sql);
        _tokens = this.concatComments(_tokens);
        _tokens = this.concatEscapeSequences(_tokens);
        _tokens = this.balanceBackticks(_tokens);
        _tokens = this.concatColReferences(_tokens);
        _tokens = this.balanceParenthesis(_tokens);
        _tokens = this.concatUserDefinedVariables(_tokens);
        _tokens = this.concatScientificNotations(_tokens);
        _tokens = this.concatNegativeNumbers(_tokens);
        return _tokens;
    }

    concatNegativeNumbers(_tokens) {
        var _i = null;
        var _cnt = null;
        var _possibleSign = null;
        var _token = null;


        _i = 0;
        _cnt = (0, _count3.default)(_tokens);
        _possibleSign = true;
        while (_i < _cnt) {
            if (!_tokens[_i]) {
                _i++;
                continue;
            }
            _token = _tokens[_i];
            if (_possibleSign === true) {
                if (_token === "-" || _token === "+") {
                    if ((0, _is_numeric2.default)(_tokens[_i + 1])) {
                        _tokens[_i + 1] = _token + _tokens[_i + 1];
                        delete _tokens[_i];
                    }
                }
                _possibleSign = false;
                continue;
            }
            if ((0, _substr2.default)(_token, -1, 1) === "," || (0, _substr2.default)(_token, -1, 1) === "(") {
                _possibleSign = true;
            }
            _i++;
        }
        return (0, _array_values2.default)(_tokens);
    }

    concatScientificNotations(_tokens) {
        var _i = null;
        var _cnt = null;
        var _scientific = null;
        var _token = null;


        _i = 0;
        _cnt = (0, _count3.default)(_tokens);
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
                } else if ((0, _is_numeric2.default)(_token)) {
                    _tokens[_i - 1] += _tokens[_i];
                    delete _tokens[_i];
                }
                _scientific = false;
                continue;
            }
            if ((0, _strtoupper2.default)((0, _substr2.default)(_token, -1, 1)) === "E") {
                _scientific = (0, _is_numeric2.default)((0, _substr2.default)(_token, 0, -1));
            }
            _i++;
        }
        return (0, _array_values2.default)(_tokens);
    }

    concatUserDefinedVariables(_tokens) {
        var _i = null;
        var _cnt = null;
        var _userdef = null;
        var _token = null;


        _i = 0;
        _cnt = (0, _count3.default)(_tokens);
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
        return (0, _array_values2.default)(_tokens);
    }

    concatComments(_tokens) {
        var _i = null;
        var _cnt = null;
        var _comment = null;
        var _token = null;
        var _inline = null;


        _i = 0;
        _cnt = (0, _count3.default)(_tokens);
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
            if (_comment === false && (0, _substr2.default)(_token, 0, 1) === "#") {
                _comment = _i;
                _inline = true;
            }
            if (_comment === false && _token === "/*") {
                _comment = _i;
                _inline = false;
            }
            _i++;
        }
        return (0, _array_values2.default)(_tokens);
    }

    isBacktick(_token) {
        return _token === "'" || _token === "\"" || _token === "`";
    }

    balanceBackticks(_tokens) {
        var _i = null;
        var _cnt = null;
        var _token = null;


        _i = 0;
        _cnt = (0, _count3.default)(_tokens);
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
    }

    balanceCharacter(_tokens, _idx, _char) {
        var _token_count = null;
        var _i = null;
        var _token = null;


        _token_count = (0, _count3.default)(_tokens);
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
        return (0, _array_values2.default)(_tokens);
    }

    concatColReferences(_tokens) {
        var _cnt = null;
        var _i = null;
        var _k = null;
        var _len = null;


        _cnt = (0, _count3.default)(_tokens);
        _i = 0;
        while (_i < _cnt) {
            if (!_tokens[_i]) {
                _i++;
                continue;
            }
            if (_tokens[_i][0] === ".") {
                _k = _i - 1;
                _len = (0, _strlen2.default)(_tokens[_i]);
                while (_k >= 0 && _len == (0, _strlen2.default)(_tokens[_i])) {
                    if (!_tokens[_k]) {
                        _k--;
                        continue;
                    }
                    _tokens[_i] = _tokens[_k] + _tokens[_i];
                    delete _tokens[_k];
                    _k--;
                }
            }
            if (this.endsWith(_tokens[_i], ".") && !(0, _is_numeric2.default)(_tokens[_i])) {
                _k = _i + 1;
                _len = (0, _strlen2.default)(_tokens[_i]);
                while (_k < _cnt && _len == (0, _strlen2.default)(_tokens[_i])) {
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
        return (0, _array_values2.default)(_tokens);
    }

    concatEscapeSequences(_tokens) {
        var _tokenCount = null;
        var _i = null;


        _tokenCount = (0, _count3.default)(_tokens);
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
        return (0, _array_values2.default)(_tokens);
    }

    balanceParenthesis(_tokens) {
        var _token_count = null;
        var _i = null;
        var _count = null;
        var _n = null;
        var _token = null;


        _token_count = (0, _count3.default)(_tokens);
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
        return (0, _array_values2.default)(_tokens);
    }
};
exports.default = JSSQLLexer;