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

    return hasKnex[typeName](tableName).context(this, hasKnex[typeName]);
};

require("./ext");

var _knex = require("knex");

var _knex2 = _interopRequireDefault(_knex);

var _builder = require("knex/lib/query/builder");

var _builder2 = _interopRequireDefault(_builder);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const log = (0, _debug2.default)('code.knex');
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

_builder2.default.prototype.context = function (ctx) {
    this.ctx = ctx;
    return this;
};

const clone = _builder2.default.prototype.clone;

_builder2.default.prototype.clone = function () {
    return clone.call(this).context(this.ctx);
};

const then = _builder2.default.prototype.then;

_builder2.default.prototype.then = _asyncToGenerator(function* () {
    this.on('start', this._onStart).on('end', this._onEnd).on('query', this._onQuery).on('query-response', this._onQueryResponse).on('query-error', this._onQueryError);

    for (let idx in this._statements) {
        let _state = this._statements[idx];
        let { column, grouping, value } = _state;

        switch (grouping) {
            case "columns":
                for (let i in value) {
                    if ((0, _isString2.default)(value[i])) {
                        let [field, asField] = value[i].split(' as ');
                        if (this._mapping && this._mapping[field]) {
                            value[i] = this._mapping[field] + (asField ? ` as ${asField}` : '');
                        }
                    }
                }
                break;
            case "where":
                if (this._mapping && this._mapping[column]) {
                    _state.column = this._mapping[column];
                }
                break;
        }
    }

    const result = this.client.runner(this).run();
    return result.then.apply(result, arguments);
});

_builder2.default.prototype.sql = function (name) {
    let { module } = this.ctx;
    this._mapping = {};
    if (jinghuan.app.sql && jinghuan.app.sql[module] && jinghuan.app.sql[module][name]) {
        let sql = jinghuan.app.sql[module][name];
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
            this.select(_knex2.default.raw(pts.select));
        }
        if (pts.from) {
            this.from(_knex2.default.raw(pts.from));
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