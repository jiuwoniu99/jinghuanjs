"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (tableName = null, typeName = 'default') {
    let config = jinghuan.config(`database.${typeName}`);
    let { type, port, host, user, password, database, min, max, logSql } = config;

    if (!hasKnex[typeName]) {
        hasKnex[typeName] = (0, _knex2.default)({
            client: type,
            connection: {
                port,
                host,
                user,
                password,
                database
            },
            pool: { min: min || 0, max: max || 255 },
            logSql,
            fields: {}
        });
    }

    let ret = hasKnex[typeName](tableName);
    ret.ctx = this;

    return ret;
};

require("./ext");

var _knex = require("knex");

var _knex2 = _interopRequireDefault(_knex);

var _builder = require("knex/lib/query/builder");

var _builder2 = _interopRequireDefault(_builder);

var _raw = require("knex/lib/raw");

var _raw2 = _interopRequireDefault(_raw);

var _strtolower = require("locutus/php/strings/strtolower");

var _strtolower2 = _interopRequireDefault(_strtolower);

var _trim = require("locutus/php/strings/trim");

var _trim2 = _interopRequireDefault(_trim);

var _isString = require("lodash/isString");

var _isString2 = _interopRequireDefault(_isString);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _JSSQLLexer = require("./lib/lexer/JSSQLLexer");

var _JSSQLLexer2 = _interopRequireDefault(_JSSQLLexer);

var _get = require("lodash/get");

var _get2 = _interopRequireDefault(_get);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const log = (0, _debug2.default)('JH:code/knex');
const hasKnex = {};


function ParseTokens(tokens) {
    let brackets = 0;
    let is_string = null;
    let translation = false;
    let is_field = false;

    let select = [];
    let from = [];
    let where = [];
    let group = [];
    let having = [];
    let order = [];
    let temp = null;

    for (let k in tokens) {
        let token = tokens[k];
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

_builder2.default.prototype.clear = function () {
    this._clearGrouping('where');
    this._clearGrouping('columns');
    delete this._single.limit;
    delete this._single.offset;
};

_builder2.default.prototype._onStart = function (data) {};

_builder2.default.prototype._onEnd = function (data) {};

_builder2.default.prototype._onQuery = function (data) {
    let lexer = new _JSSQLLexer2.default();
    let tokens = lexer.split(data.sql);
    let checkWhere = false;

    switch (data.method) {
        case 'counter':
        case 'update':
            for (let val of tokens) {
                checkWhere = val.toLocaleLowerCase() === 'where';
                if (checkWhere) {
                    break;
                }
            }
            if (!checkWhere && this.client.config.logSql === true) {
                this.ctx.slog.warn(`The sql [${data.sql}] statement lacks the [where] condition`);
            }
            break;
    }
    this._s_time = new Date().getTime();
};

_builder2.default.prototype._onQueryResponse = function (response, data, builder) {
    if (this.client.config.logSql === true) {
        let _e_time = new Date().getTime();
        let sql = this.client._formatQuery(data.sql, data.bindings);
        this.ctx.slog.sql(sql + ` -- ${_e_time - this._s_time}ms`);
    }
};

_builder2.default.prototype._onQueryError = function (error, obj) {
    if (this.client.config.logSql === true) {
        this.ctx.slog.error(error);
    }
};

_builder2.default.prototype.ctx = null;

const clone = _builder2.default.prototype.clone;

_builder2.default.prototype.clone = function () {
    let ret = clone.call(this);
    ret.ctx = this.ctx;
    return ret;
};

const then = _builder2.default.prototype.then;

_builder2.default.prototype.then = _asyncToGenerator(function* () {
    this.on('start', this._onStart).on('end', this._onEnd).on('query', this._onQuery).on('query-response', this._onQueryResponse).on('query-error', this._onQueryError);

    const result = this.client.runner(this).run();
    return result.then.apply(result, arguments);
});

_builder2.default.prototype.raw = _knex2.default.raw;

let toSQL = _builder2.default.prototype.toSQL;
_builder2.default.prototype.toSQL = function (method, tz) {

    let Compiler = this.client.queryCompiler(this);
    if (this._mapping) {
        let mapping = this._mapping;
        let { grouped, single } = Compiler;
        if (grouped.columns) {
            grouped.columns.map(function () {});
        }
        if (grouped.where) {
            grouped.where.map(function (where) {
                if (where.column && mapping[where.column]) {
                    where.column = mapping[where.column];
                } else if (where.value instanceof _raw2.default) {
                    let { sql, bindings } = where.value;
                    let index = 0;
                    sql.replace(/\\?\?\??/g, match => {
                        if (match === '??') {
                            var value = bindings[index];
                            bindings[index] = mapping[value] || values;
                            index++;
                        }
                    });
                }
            });
        }
    }

    return Compiler.toSQL(method || this._method, tz);
};

_builder2.default.prototype.sql = function (name) {
    let { module } = this.ctx;
    this._mapping = {};
    let sql = (0, _get2.default)(jinghuan.sql, `${module}.${name}`);
    if ((0, _isString2.default)(sql)) {
        let lines = sql.split('\n');
        let notes = [];
        let codes = [];

        for (let i in lines) {
            if (lines[i].startsWith('#')) {
                notes.push(lines[i]);
            } else {
                codes.push(lines[i]);
            }
        }

        for (let i in notes) {
            let [field, mapping] = notes[i].substr(1).split(/\s+/);
            if (field && mapping) {
                this._mapping[field] = mapping;
            }
        }

        sql = codes.join('\n');

        let lexer = new _JSSQLLexer2.default();
        let tokens = lexer.split(sql);
        let pts = ParseTokens(tokens);
        if (pts.select) {
            this.select(this.raw(pts.select));
        }
        if (pts.from) {
            this.from(this.raw(pts.from));
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

;