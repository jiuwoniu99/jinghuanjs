'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helper = require('../helper');

var _helper2 = _interopRequireDefault(_helper);

var _parseAdapter = require('../helper/parseAdapter');

var _parseAdapter2 = _interopRequireDefault(_parseAdapter);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let Session = class Session {
    constructor(ctx) {
        var _this = this;

        this.options = {};
        this.cache = {};

        this.run = (() => {
            var _ref = _asyncToGenerator(function* (name, value, options) {

                let config = jinghuan.config('session');
                _this.options = (0, _parseAdapter2.default)(config, options);

                (0, _assert2.default)((0, _isFunction2.default)(_this.options.handle), 'session.handle must be a function');

                let Adapter = _this.options.handle;
                let key = _helper2.default.md5(JSON.stringify(_this.options));

                if (!_this.cache[key]) _this.cache[key] = new Adapter(_this.ctx, _this.options.options);

                if (_helper2.default.isEmpty(value)) {
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