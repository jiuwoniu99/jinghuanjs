'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _lodash = require('lodash');

var _strtolower = require('locutus/php/strings/strtolower');

var _strtolower2 = _interopRequireDefault(_strtolower);

var _trim = require('locutus/php/strings/trim');

var _trim2 = _interopRequireDefault(_trim);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var helper = require('../helper');
var knex = require('knex');
var builder = require('knex/lib/query/builder');
var compiler = require('knex/lib/query/compiler');


var JSSQLLexer = require('./lib/lexer/JSSQLLexer');
var log = require('debug')('code.knex');
//

var hasKnex = {};

//var components = ['columns', 'join', 'where', 'union', 'group', 'having', 'order', 'limit', 'offset', 'lock'];
//
//compiler.prototype.select = function () {
//    let sql = this.with();
//
//    const statements = components.map(component =>
//        this[component](this)
//    );
//    sql += compact(statements).join(' ');
//    return sql;
//}
//
//compiler.prototype.columns = function () {
//    let distinct = false;
//    if (this.onlyUnions()) return ''
//    const columns = this.grouped.columns || []
//    let i = -1, sql = [];
//    if (columns) {
//        while (++i < columns.length) {
//            const stmt = columns[i];
//            if (stmt.distinct) distinct = true
//            if (stmt.type === 'aggregate') {
//                sql.push(this.aggregate(stmt))
//            }
//            else if (stmt.type === 'aggregateRaw') {
//                sql.push(this.aggregateRaw(stmt))
//            }
//            else if (stmt.value && stmt.value.length > 0) {
//                sql.push(this.formatter.columnize(stmt.value))
//            }
//        }
//    }
//    if (sql.length === 0) sql = ['*'];
//    return `select ${distinct ? 'distinct ' : ''}` +
//        sql.join(', ') + (this.tableName
//            ? ` from ${this.single.only ? 'only ' : ''}${this.tableName}`
//            : '');
//}

function ParseTokens(tokens) {
    var brackets = 0;
    var is_string = null;
    var translation = false;
    var is_field = false;

    var select = [];
    var from = [];
    var where = [];
    var group = [];
    var having = [];
    var order = [];
    var temp = null;

    for (var k in tokens) {
        var token = tokens[k];
        if (translation && (token !== "\"" || token !== "'")) {
            translation = false;
        } else if (token === "\"" || token === "'") {
            if (translation) {
                translation = false;
            } else if (is_string === token) {
                is_string = null;
            } else {
                is_string = token;
            }
        } else if (token === "\\") {
            if (is_string) {
                translation = true;
            }
        } else if (token === "`" && !is_string) {
            is_field = !is_field;
        } else if (is_string) {} else if (is_field) {} else {
            switch ((0, _strtolower2.default)(token)) {
                case "(":
                    brackets++;
                    break;
                case ")":
                    brackets--;
                    break;
                //#转译
                case "select":
                    if (brackets == 0) temp = select;
                    break;
                case "from":
                    if (brackets == 0) temp = from;
                    break;
                case "where":
                    if (brackets == 0) temp = where;
                    break;
                case "group":
                    if (brackets == 0) temp = group;
                    break;
                case "having":
                    if (brackets == 0) temp = having;
                    break;
                case "order":
                    if (brackets == 0) temp = order;
                    break;
            }
        }
        temp && temp.push(token);
    }

    select = select.slice(1);
    from = from.slice(1);
    where = where.slice(1);
    group = group.slice(3);
    having = having.slice(1);
    order = order.slice(3);

    return {
        select: (0, _trim2.default)(select.join("")),
        from: (0, _trim2.default)(from.join("")),
        where: (0, _trim2.default)(where.join("")),
        group: (0, _trim2.default)(group.join("")),
        having: (0, _trim2.default)(having.join("")),
        order: (0, _trim2.default)(order.join(""))
    };
}

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
 * @param data
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
builder.prototype.context = function (ctx) {
    this.ctx = ctx;
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
    return clone.call(this).context(this.ctx);
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
    var idx,
        _state,
        column,
        grouping,
        value,
        i,
        _value$i$split,
        field,
        asField,
        result,
        _args = arguments;

    return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    this.on('start', this._onStart).on('end', this._onEnd).on('query', this._onQuery).on('query-response', this._onQueryResponse).on('query-error', this._onQueryError);

                    //let table = this._single.table;
                    //let builder = this.client.queryBuilder();
                    //
                    //// 获取表的结构并缓存
                    //if (/[a-zA-Z_0-9]+/.test(table)
                    //    && this.client.config.fields
                    //    && !this.client.config.fields[table]
                    //    && this._method !== 'columnInfo'
                    //    && helper.isString(table)) {
                    //    try {
                    //        this.client.config.fields[table] = await builder
                    //            .table(table)
                    //            .context(this.ctx)
                    //            .columnInfo();
                    //    } catch (ex) {
                    //
                    //    }
                    //}

                    _context.t0 = _regenerator2.default.keys(this._statements);

                case 2:
                    if ((_context.t1 = _context.t0()).done) {
                        _context.next = 15;
                        break;
                    }

                    idx = _context.t1.value;
                    _state = this._statements[idx];
                    column = _state.column, grouping = _state.grouping, value = _state.value;

                    // _mapping字段映射只针对查询字段和查询条件

                    _context.t2 = grouping;
                    _context.next = _context.t2 === "columns" ? 9 : _context.t2 === "where" ? 11 : 13;
                    break;

                case 9:
                    for (i in value) {
                        if ((0, _lodash.isString)(value[i])) {
                            _value$i$split = value[i].split(' as '), field = _value$i$split[0], asField = _value$i$split[1];

                            if (this._mapping && this._mapping[field]) {
                                value[i] = this._mapping[field] + (asField ? ' as ' + asField : '');
                            }
                        }
                    }
                    return _context.abrupt('break', 13);

                case 11:
                    if (this._mapping && this._mapping[column]) {
                        _state.column = this._mapping[column];
                    }
                    return _context.abrupt('break', 13);

                case 13:
                    _context.next = 2;
                    break;

                case 15:
                    result = this.client.runner(this).run();
                    return _context.abrupt('return', result.then.apply(result, _args));

                case 17:
                case 'end':
                    return _context.stop();
            }
        }
    }, _callee, this);
}));

/**
 * 解析已
 * @param name
 */
builder.prototype.sql = function (name) {
    var module = this.ctx.module;

    this._mapping = {};
    if (jinghuan.app.sql && jinghuan.app.sql[module] && jinghuan.app.sql[module][name]) {
        var sql = jinghuan.app.sql[module][name];
        var lines = sql.split('\n');
        var notes = [];
        var codes = [];

        for (var i in lines) {
            if (lines[i].startsWith('#')) {
                notes.push(lines[i]);
            } else {
                codes.push(lines[i]);
            }
        }

        for (var _i2 in notes) {
            var _notes$_i2$substr$spl = notes[_i2].substr(1).split(/\s+/),
                field = _notes$_i2$substr$spl[0],
                mapping = _notes$_i2$substr$spl[1];

            if (field && mapping) {
                this._mapping[field] = mapping;
            }
        }

        sql = codes.join('\n');

        var lexer = new JSSQLLexer();
        var tokens = lexer.split(sql);
        var pts = ParseTokens(tokens);
        if (pts.select) {
            this.select(knex.raw(pts.select));
        }
        if (pts.from) {
            this.from(knex.raw(pts.from));
        }
        if (pts.where) {
            this.whereRaw(pts.where);
        }
        if (pts.order) {
            this.orderByRaw(pts.group);
        }
        if (pts.group) {
            this.groupByRaw(pts.group);
        }
        if (pts.having) {
            this.havingRaw(pts.group);
        }
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