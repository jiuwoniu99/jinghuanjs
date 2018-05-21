'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const helper = _safeRequire('../helper');

const parseAdapter = _safeRequire('../helper/parseAdapter');

const assert = _safeRequire('assert');

const isFunction = _safeRequire('lodash/isFunction');

let Session = class Session {
    constructor(ctx) {
        var _this = this;

        this.options = {};
        this.cache = {};

        this.run = (() => {
            var _ref = _asyncToGenerator(function* (name, value, options) {

                let config = jinghuan.config('session');
                _this.options = parseAdapter(config, options);

                assert(isFunction(_this.options.handle), 'session.handle must be a function');

                let Adapter = _this.options.handle;
                let key = helper.md5(JSON.stringify(_this.options));

                if (!_this.cache[key]) _this.cache[key] = new Adapter(_this.ctx, _this.options.options);

                if (helper.isEmpty(value)) {
                    return yield _this.cache[key].get(name);
                } else {
                    return yield _this.cache[key].set(name, value);
                }
            });

            return function (_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            };
        })();

        this.ctx = ctx;
    }

    finish() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            for (let i in _this2.cache) {
                yield _this2.cache[i].flush();
            }
        })();
    }
};
exports.default = Session;

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