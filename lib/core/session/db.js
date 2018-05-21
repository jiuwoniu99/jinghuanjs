"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const assert = _safeRequire("assert");

const time = _safeRequire("locutus/php/datetime/time");

const helper = _safeRequire("../helper");

const uuid = _safeRequire("uuid");

const ksort = _safeRequire("locutus/php/array/ksort");

const initSessionData = Symbol('jinghuan-session-db-init');

let DbSession = class DbSession {
    constructor(ctx, options) {
        var _this = this;

        assert(options.table, '.table required');

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

                let { id, table, fields, db_type } = _this2.options;

                let sessid = _this2.ctx.cookies.get(id);

                if (helper.isEmpty(sessid)) {
                    try {
                        _this2.id = uuid.v4();
                        yield _this2.ctx.db(table, db_type).insert({ id: _this2.id, data: '{}', expires: time() });
                    } catch (e) {
                        console.error(e);
                    } finally {
                        _this2.data = {};
                    }
                } else {
                    try {
                        _this2.data = {};

                        let data = yield _this2.ctx.db(table, db_type).where({ id: sessid }).first();

                        _this2.data = JSON.parse(data.data);

                        if (data[_this2.expires] < time()) {
                            _this2.data = {};
                        }
                    } catch (e) {
                        _this2.data = {};
                        console.error(e);
                    }
                }
            }

            ksort(_this2.data);
            _this2.key = helper.md5(JSON.stringify(_this2.data));
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
            let { table, db_type } = _this6.options;

            ksort(_this6.data);
            let key = helper.md5(JSON.stringify(_this6.data));
            if (_this6.key !== key) {
                let val = {
                    data: JSON.stringify(_this6.data),
                    expires: time() + _this6.options.expires
                };
                yield _this6.ctx.db(table, db_type).where({ id: _this6.id }).update(val);
                _this6.ctx.cookies.set(_this6.options.id, _this6.id, { maxAge: _this6.options.expires });
            }
        })();
    }

};
exports.default = DbSession;

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