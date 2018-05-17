"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _preg_quote = require("locutus/php/pcre/preg_quote");

var _preg_quote2 = _interopRequireDefault(_preg_quote);

var _implode = require("locutus/php/strings/implode");

var _implode2 = _interopRequireDefault(_implode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let LexerSplitter = class LexerSplitter {

    constructor() {
        this.splitters = ["<=>", "\r\n", "!=", ">=", "<=", "<>", "<<", ">>", ":=", "\\", "&&", "||", ":=", "/*", "*/", "--", ">", "<", "|", "=", "^", "(", ")", "\t", "\n", "'", "\"", "`", ",", "@", " ", "+", "-", "*", "/", ";"];

        this.splitterPattern = this.convertSplittersToRegexPattern(this.splitters);
    }

    getSplittersRegexPattern() {
        return this.splitterPattern;
    }

    convertSplittersToRegexPattern(_splitters) {
        var _regex_parts = [];
        var _part = null;
        var _pattern = null;


        _regex_parts = [];
        for (var __key in _splitters) {
            var _part = _splitters[__key];

            _part = (0, _preg_quote2.default)(_part);
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
        _pattern = (0, _implode2.default)("|", _regex_parts);
        return "/(" + _pattern + ")/";
    }
};
exports.default = LexerSplitter;