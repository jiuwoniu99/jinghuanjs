"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

const preg_quote = _safeRequire("locutus/php/pcre/preg_quote");

const implode = _safeRequire("locutus/php/strings/implode");

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
    }
};
exports.default = LexerSplitter;

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}