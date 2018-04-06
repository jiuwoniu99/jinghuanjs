'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = require('assert');
var initSessionData = Symbol('jinghuan-session-db-init');
var time = require('locutus/php/datetime/time');

/**
 *
 */

var DbSession = function () {
    /**
     *
     * @param options
     * @param ctx
     */
    function DbSession(options, ctx) {
        var _this = this;

        _classCallCheck(this, DbSession);

        assert(options.table, '.table required');
        //
        this.options = options;

        //
        this.key = 'id';
        this.content = 'data';
        this.expires = 'expires';

        //
        if (this.options.fields) {
            var _options$fields = this.options.fields,
                key = _options$fields.key,
                content = _options$fields.content,
                expires = _options$fields.expires;

            this.key = key || this.key;
            this.content = content || this.content;
            this.expires = expires || this.expires;
        }

        //
        this.ctx = ctx;
        this.ctx.res.once('finish', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return _this.flush();

                        case 2:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        })));
    }

    /**
     *
     * @return {Promise<void>}
     */


    DbSession.prototype[initSessionData] = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var data, val;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (!this.data) {
                            _context2.next = 3;
                            break;
                        }

                        _context2.next = 18;
                        break;

                    case 3:
                        _context2.next = 5;
                        return this.ctx.db(this.options.table).where(this.key, this.options.cookie).first();

                    case 5:
                        data = _context2.sent;

                        if (!(data == null)) {
                            _context2.next = 16;
                            break;
                        }

                        val = {};

                        val[this.key] = this.options.cookie;
                        val[this.content] = JSON.stringify({});
                        val[this.expires] = time() + this.options.maxAge;

                        // 创建数据
                        _context2.next = 13;
                        return this.ctx.db(this.options.table).insert(val);

                    case 13:
                        this.data = {};
                        _context2.next = 18;
                        break;

                    case 16:
                        // 解析数据
                        try {
                            this.data = JSON.parse(data.data);
                        } catch (ex) {
                            this.data = {};
                        }

                        // session 过时
                        if (data[this.expires] < time()) {
                            this.delete();
                        }

                    case 18:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    /**
     *
     * @param name
     * @return {Promise<{}|*>}
     */

    DbSession.prototype.get = function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(name) {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return this[initSessionData]();

                        case 2:
                            return _context3.abrupt('return', name ? this.data[name] : this.data);

                        case 3:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function get(_x) {
            return _ref3.apply(this, arguments);
        }

        return get;
    }();

    /**
     *
     * @param name
     * @param value
     * @return {Promise<void>}
     */


    DbSession.prototype.set = function () {
        var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(name, value) {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return this[initSessionData]();

                        case 2:
                            if (value === null) {
                                delete this.data[name];
                            } else {
                                this.data[name] = value;
                            }

                        case 3:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function set(_x2, _x3) {
            return _ref4.apply(this, arguments);
        }

        return set;
    }();

    /**
     *
     * @return {Promise<void>}
     */


    DbSession.prototype.delete = function () {
        var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            // this.status = -1;
                            this.data = {};

                        case 1:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function _delete() {
            return _ref5.apply(this, arguments);
        }

        return _delete;
    }();

    /**
     *
     * @return {Promise<void>}
     */


    DbSession.prototype.flush = function () {
        var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
            var val;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            val = {};

                            val[this.content] = JSON.stringify(this.data);
                            val[this.expires] = time() + this.options.maxAge;

                            _context6.next = 5;
                            return this.ctx.db(this.options.table).where(this.key, this.options.cookie).update(val);

                        case 5:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function flush() {
            return _ref6.apply(this, arguments);
        }

        return flush;
    }();

    /**
     * gc
     */


    DbSession.prototype.gc = function gc() {};

    return DbSession;
}();

module.exports = DbSession;