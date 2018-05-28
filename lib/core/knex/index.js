"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

_safeRequire("./ext");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const knex = _safeRequire("knex");

const builder = _safeRequire("knex/lib/query/builder");

const Raw = _safeRequire("knex/lib/raw");

const strtolower = _safeRequire("locutus/php/strings/strtolower");

const trim = _safeRequire("locutus/php/strings/trim");

const isString = _safeRequire("lodash/isString");

const isFunction = _safeRequire("lodash/isFunction");

const debug = _safeRequire("debug");

const JSSQLLexer = _safeRequire("./lib/lexer/JSSQLLexer");

const get = _safeRequire("lodash/get");

const log = debug('JH:code/knex');
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
            switch (strtolower(token)) {
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
        select: trim(select.join("")),
        from: trim(from.join("")),
        where: trim(where.join("")),
        group: trim(group.join("")),
        having: trim(having.join("")),
        order: trim(order.join(""))
    };
}

builder.prototype.clear = function () {
    this._clearGrouping('where');
    this._clearGrouping('columns');
    delete this._single.limit;
    delete this._single.offset;
};

builder.prototype._onStart = function (data) {};

builder.prototype._onEnd = function (data) {};

builder.prototype._onQuery = function (data) {
    let lexer = new JSSQLLexer();
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
            if (!checkWhere) {
                throw new Error(`The sql [${data.sql}] statement lacks the [where] condition`);
                if (this.client.config.logSql === true) this.ctx.slog.warn(`The sql [${data.sql}] statement lacks the [where] condition`);
            }
            break;
    }
    this._s_time = new Date().getTime();
};

builder.prototype._onQueryResponse = function (response, data, builder) {
    if (this.client.config.logSql === true) {
        let _e_time = new Date().getTime();
        let sql = this.client._formatQuery(data.sql, data.bindings);
        this.ctx.slog.sql(sql + ` -- ${_e_time - this._s_time}ms`);
    }
};

builder.prototype._onQueryError = function (error, obj) {
    if (this.client.config.logSql === true) {
        this.ctx.slog.error(error);
    }
};

builder.prototype.ctx = null;

builder.prototype.context = function (ctx) {
    this.ctx = ctx;
    return this;
};

const clone = builder.prototype.clone;

builder.prototype.clone = function () {
    let ret = clone.call(this);
    ret.ctx = this.ctx;
    return ret;
};

const then = builder.prototype.then;

builder.prototype.then = _asyncToGenerator(function* () {
    this.on('start', this._onStart).on('end', this._onEnd).on('query', this._onQuery).on('query-response', this._onQueryResponse).on('query-error', this._onQueryError);

    let table = this._single.table;

    if (/[a-zA-Z_0-9]+/.test(table) && this.client.config.tableInfos && !this.client.config.tableInfos[table] && this._method !== 'columnInfo' && isString(table)) {
        try {

            let builder = this.client.queryBuilder();
            builder.ctx = this.ctx;
            let tableInfo = yield builder.table(table).columnInfo();
            this.client.config.tableInfos[table] = tableInfo;
        } catch (ex) {
            console.error(ex);
        }
    }
    const result = this.client.runner(this).run();
    return result.then.apply(result, arguments);
});

builder.prototype.raw = function (...args) {
    return this.client.raw(...args);
};

let toSQL = builder.prototype.toSQL;
builder.prototype.toSQL = function (method, tz) {

    let Compiler = this.client.queryCompiler(this);
    if (this._mapping) {
        let mapping = this._mapping;
        let {
            grouped,
            single
        } = Compiler;

        if (grouped.columns) {
            grouped.columns.map(function (select) {
                let {
                    value
                } = select;
                (value || []).map((column, index) => {
                    if (isString(column)) {
                        value[index] = mapping[column] || value[index];
                    }
                });
            });
        }

        if (grouped.where) {
            grouped.where.map(function (where) {
                if (where.column && mapping[where.column]) {
                    where.column = mapping[where.column];
                } else if (where.value instanceof Raw) {
                    let {
                        sql,
                        bindings
                    } = where.value;
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

builder.prototype.sql = function (name) {
    let {
        module
    } = this.ctx;
    this._mapping = {};
    let sql = get(jinghuan.sql, `${module}.${name}`);
    if (isString(sql)) {
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

        let lexer = new JSSQLLexer();
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

var db = function (tableName = 'jh_table_default', typeName = 'default') {
    var _this = this;

    let config = jinghuan.config(`database.${typeName}`);
    let {
        type,
        port,
        host,
        user,
        password,
        database,
        min,
        max,
        logSql
    } = config;

    if (!hasKnex[typeName]) {
        hasKnex[typeName] = knex({
            client: type,
            connection: {
                port,
                host,
                user,
                password,
                database
            },
            pool: {
                min: min || 0,
                max: max || 255
            },
            logSql,
            tableInfos: {}
        });
    }

    if (isFunction(tableName)) {
        let _trx;
        let _config = isString(typeName) ? {} : typeName;
        return hasKnex[typeName].transaction((() => {
            var _ref2 = _asyncToGenerator(function* (trx) {
                _trx = trx;
                return yield tableName(function (tableName2) {
                    let ret = hasKnex[typeName](tableName2);
                    ret.ctx = _this;
                    ret.transacting(trx);
                    return ret;
                });
            });

            return function (_x) {
                return _ref2.apply(this, arguments);
            };
        })(), _config).then(data => {
            if (config.logSql === true) {
                this.slog.sql('commit');
            }
            _trx.commit();
            return data;
        }).catch(error => {
            console.error(error);
            if (config.logSql === true) {
                this.slog.sql(`rollback ${error}`);
            }
            _trx.rollback(error);
        });
    } else if (isString(tableName)) {
        let ret = hasKnex[typeName](tableName);
        ret.ctx = this;
        return ret;
    }
};
exports.default = db;

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