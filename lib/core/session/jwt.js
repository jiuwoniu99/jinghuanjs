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
                    let promise = new Promise(function (resolve, reject) {
                        let cb = function (err, json) {
                            if (err) {
                                resolve({});
                            } else {
                                (0, _ksort2.default)(json);
                                resolve(json);
                            }
                        };
                        if (!_helper2.default.isEmpty(_this2.options.privateKey) && _helper2.default.isFile(_this2.options.privateKey)) {
                            let cert = _fsExtra2.default.readFileSync(_this2.options.privateKey);
                            jinghuan.jwt.verify(sessid, cert, cb);
                        } else {
                            jinghuan.jwt.verify(sessid, _this2.options.secret, cb);
                        }
                    });
                    _this2.data = yield promise;
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
                let token = '';
                if (!_helper2.default.isEmpty(_this6.options.privateKey) && _helper2.default.isFile(_this6.options.privateKey)) {
                    let cert = _fsExtra2.default.readFileSync(_this6.options.privateKey);
                    token = jinghuan.jwt.sign(_this6.data, cert, { algorithm: 'HS256', expiresIn: _this6.options.expires });
                } else {
                    token = jinghuan.jwt.sign(_this6.data, _this6.options.secret, { expiresIn: _this6.options.expires });
                }

                _this6.ctx.cookies.set(_this6.options.id, token, { maxAge: _this6.options.expires });
            }
        })();
    }
};
exports.default = JwtSession;