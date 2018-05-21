"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const assert = _safeRequire("assert");

const time = _safeRequire("locutus/php/datetime/time");

const helper = _safeRequire("../helper");

const path = _safeRequire("path");

const fs = _safeRequire("fs-extra");

const ksort = _safeRequire("locutus/php/array/ksort");

const crypto = _safeRequire("crypto");

const pako = _safeRequire("pako");

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
                if (helper.isEmpty(sessid)) {
                    _this2.data = {};
                } else {
                    let promise = new Promise(function (resolve, reject) {
                        let cb = function (err, json) {
                            if (err) {
                                resolve({});
                            } else {
                                ksort(json);
                                resolve(json);
                            }
                        };
                        if (!helper.isEmpty(_this2.options.privateKey) && helper.isFile(_this2.options.privateKey)) {
                            let cert = fs.readFileSync(_this2.options.privateKey);
                            jinghuan.jwt.verify(sessid, cert, cb);
                        } else {
                            jinghuan.jwt.verify(sessid, _this2.options.secret, cb);
                        }
                    });
                    _this2.data = yield promise;
                }
                _this2.key = helper.md5(JSON.stringify(_this2.data));
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
            let key = helper.md5(JSON.stringify(_this6.data));
            if (key !== _this6.key) {
                let token = '';
                if (!helper.isEmpty(_this6.options.privateKey) && helper.isFile(_this6.options.privateKey)) {
                    let cert = fs.readFileSync(_this6.options.privateKey);
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