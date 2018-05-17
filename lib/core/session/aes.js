"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _time = require("locutus/php/datetime/time");

var _time2 = _interopRequireDefault(_time);

var _helper = require("../helper");

var _helper2 = _interopRequireDefault(_helper);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _ksort = require("locutus/php/array/ksort");

var _ksort2 = _interopRequireDefault(_ksort);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _pako = require("pako");

var _pako2 = _interopRequireDefault(_pako);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const initSessionData = Symbol('jinghuan-session-db-init');

let JwtSession = class JwtSession {

    constructor(ctx, options) {
        var _this = this;

        this.aes_algorithm = "aes-256-ecb";

        this.decrypt = function (text, secrect) {
            let aes_secrect = _helper2.default.md5(secrect);
            let decipher = _crypto2.default.createDecipher(this.aes_algorithm, aes_secrect);
            let dec = decipher.update(text, 'base64', 'utf8');
            dec += decipher.final('utf8');
            return dec;
        };

        this.ctx = ctx;
        this.options = options;

        this.ctx.events.on('finish', _asyncToGenerator(function* () {
            yield _this.flush();
        }));
    }

    [initSessionData]() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            if (_this2.data == null) {
                let sessid = _this2.ctx.cookies.get(_this2.options.id);
                if (_helper2.default.isEmpty(sessid)) {
                    _this2.data = {};
                } else {
                    try {
                        let data = JSON.parse(_this2.decrypt(sessid, _this2.options.secret));
                        (0, _ksort2.default)(data);
                        _this2.data = data;
                    } catch (e) {
                        _this2.data = {};
                    }
                }
                _this2.key = _helper2.default.md5(JSON.stringify(_this2.data));
            }
        })();
    }

    get(name) {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            yield _this3[initSessionData]();
            return name ? _this3.data[name] : _this3.data;
        })();
    }

    set(name, value) {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            yield _this4[initSessionData]();
            if (value === null) {
                delete _this4.data[name];
            } else {
                _this4.data[name] = value;
            }
        })();
    }

    delete() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            _this5.data = {};
        })();
    }

    flush() {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            let key = _helper2.default.md5(JSON.stringify(_this6.data));
            if (key !== _this6.key) {
                try {
                    let txt = _this6.encrypt(JSON.stringify(_this6.data), _this6.options.secret);
                    _this6.ctx.cookies.set(_this6.options.id, txt, { maxAge: _this6.options.expires });
                } catch (e) {
                    console.error(e);
                }
            }
        })();
    }

    encrypt(text, secrect) {
        let aes_secrect = _helper2.default.md5(secrect);
        let cipher = _crypto2.default.createCipher(this.aes_algorithm, aes_secrect);
        let crypted = cipher.update(text, 'utf8', 'base64');
        crypted += cipher.final('base64');
        return crypted;
    }

};
exports.default = JwtSession;