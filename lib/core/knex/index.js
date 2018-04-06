'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var helper = require('../helper');
var knex = require('knex');
var builder = require('knex/lib/query/builder');
//const _ = require('lodash');
var JSSQLLexer = require('./lib/lexer/JSSQLLexer');
//

var hasKnex = {};

/**
 *
 */
builder.prototype.clear = function () {
    this._clearGrouping('where');
    this._clearGrouping('columns');
    delete this._single.limit;
    delete this._single.offset;
};

/**
 *
 * @param data
 * @private
 */
builder.prototype._onStart = function (data) {
    //console.log('_onStart')
};

/**
 *
 * @param data
 * @private
 */
builder.prototype._onEnd = function (data) {
    //console.log('_onEnd')
};

/**
 * 查询事件 查询之前触发
 * @param data
 * @private
 */
builder.prototype._onQuery = function (data) {
    var lexer = new JSSQLLexer();
    var tokens = lexer.split(data.sql);
    var checkWhere = false;
    //console.log('_onQuery')
    switch (data.method) {
        case 'counter':
        case 'update':
            for (var _iterator = tokens, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var val = _ref;

                checkWhere = val.toLocaleLowerCase() === 'where';
                if (checkWhere) {
                    break;
                }
            }
            if (!checkWhere && this.client.config.logSql === true) {
                //throw new Error(`The sql [${data.sql}] statement lacks the [where] condition`)
                this.ctx.slog.warn('The sql [' + data.sql + '] statement lacks the [where] condition');
            }
            break;
    }
    this._s_time = new Date().getTime();
};

/**
 * 查询事件 查询之后触发
 * @param response
 * @param obj
 * @param builder
 * @private
 */
builder.prototype._onQueryResponse = function (response, data, builder) {
    if (this.client.config.logSql === true) {
        var _e_time = new Date().getTime();
        var sql = this.client._formatQuery(data.sql, data.bindings);
        this.ctx.slog.sql(sql + (' -- ' + (_e_time - this._s_time) + 'ms'));
    }
};

/**
 *
 * @param error
 * @param obj
 * @private
 */
builder.prototype._onQueryError = function (error, obj) {
    if (this.client.config.logSql === true) {
        this.ctx.slog.error(error);
    }
};

/**
 *
 * @type {null}
 */
builder.prototype.ctx = null;

/**
 *
 * @param ctx
 * @return {builder}
 */
builder.prototype.context = function (ctx, knex) {
    this.ctx = ctx;
    this._knex = knex;
    return this;
};

/**
 *
 * @type {builder.clone|*}
 */
var clone = builder.prototype.clone;

/**
 *
 */
builder.prototype.clone = function () {
    return clone.call(this).context(this.ctx, this._knex);
};

/**
 *
 * @type {builder.then|*}
 */
var then = builder.prototype.then;

/**
 * 重写 then
 * @return {*}
 */
builder.prototype.then = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var table,
        builder,
        _args = arguments;
    return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    this.on('start', this._onStart).on('end', this._onEnd).on('query', this._onQuery).on('query-response', this._onQueryResponse).on('query-error', this._onQueryError);

                    table = this._single.table;
                    builder = this.client.queryBuilder();

                    // 获取表的结构并缓存

                    if (!(this.client.config.fields && !this.client.config.fields[table] && this._method !== 'columnInfo' && helper.isString(table))) {
                        _context.next = 12;
                        break;
                    }

                    _context.prev = 4;
                    _context.next = 7;
                    return builder.table(table).context(this.ctx).columnInfo();

                case 7:
                    this.client.config.fields[table] = _context.sent;
                    _context.next = 12;
                    break;

                case 10:
                    _context.prev = 10;
                    _context.t0 = _context['catch'](4);

                case 12:
                    return _context.abrupt('return', then.apply(this, _args));

                case 13:
                case 'end':
                    return _context.stop();
            }
        }
    }, _callee, this, [[4, 10]]);
}));

/**
 * 解析已
 * @param name
 */
builder.prototype.sql = function (name) {
    var module = this.ctx.module;

    if (jinghuan.app.sql && jinghuan.app.sql[module] && jinghuan.app.sql[module][name]) {
        var sql = jinghuan.app.sql[module][name];
        var lexer = new JSSQLLexer();
        var tokens = lexer.split(sql);

        this.from(this._knex.raw('(' + sql + ') as jh_table', []));
    }
    return this;
};

/**
 *
 * @param tableName 表名
 * @param typeName 配置名称
 */
module.exports = function () {
    var tableName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var typeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';


    //数据库配置
    var config = jinghuan.config('database.' + typeName);
    var type = config.type,
        port = config.port,
        host = config.host,
        user = config.user,
        password = config.password,
        database = config.database,
        min = config.min,
        max = config.max,
        logSql = config.logSql;

    //hash值对应的 knex 配置

    if (!hasKnex[typeName]) {
        hasKnex[typeName] = knex({
            client: type,
            connection: {
                port: port,
                host: host,
                user: user,
                password: password,
                database: database
            },
            pool: { min: min || 0, max: max || 255 },
            logSql: logSql,
            fields: {}
            //debug: true
        });
    }

    /**
     *
     */
    return hasKnex[typeName](tableName).context(this, hasKnex[typeName]);
};