import './ext';
import knex from "knex"
import builder from "knex/lib/query/builder"
import Raw from 'knex/lib/raw';
import strtolower from 'locutus/php/strings/strtolower';
import trim from 'locutus/php/strings/trim';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import debug from 'debug';
import JSSQLLexer from './lib/lexer/JSSQLLexer';
import get from 'lodash/get';


const log = debug('JH:code/knex');
const hasKnex = {};

/**
 *
 *
 * @param {any} tokens
 * @returns
 */
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
        } else if (is_string) {
        } else if (is_field) {
        } else {
            switch (strtolower(token)) {
                case "(":
                    brackets++;
                    break;
                case ")":
                    brackets--;
                    break;
                //#转译
                case "select":
                    if (brackets == 0)
                        temp = select;
                    break;
                case "from":
                    if (brackets == 0)
                        temp = from;
                    break;
                case "where":
                    if (brackets == 0)
                        temp = where;
                    break;
                case "group":
                    if (brackets == 0)
                        temp = group;
                    break;
                case "having":
                    if (brackets == 0)
                        temp = having;
                    break;
                case "order":
                    if (brackets == 0)
                        temp = order;
                    break;
            }
        }
        temp && temp.push(token)
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
    }
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
                throw new Error(`The sql [${data.sql}] statement lacks the [where] condition`)
                if (this.client.config.logSql === true)
                    this.ctx.slog.warn(`The sql [${data.sql}] statement lacks the [where] condition`);
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
        let _e_time = new Date().getTime();
        let sql = this.client._formatQuery(data.sql, data.bindings);
        this.ctx.slog.sql(sql + ` -- ${_e_time - this._s_time}ms`);
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
const clone = builder.prototype.clone;

/**
 *
 */
builder.prototype.clone = function () {
    let ret = clone.call(this);
    ret.ctx = this.ctx;
    return ret;
};

/**
 *
 * @type {builder.then|*}
 */
const then = builder.prototype.then;

/**
 * 重写 then
 * @return {*}
 */
builder.prototype.then = async function () {
    this.on('start', this._onStart)
        .on('end', this._onEnd)
        .on('query', this._onQuery)
        .on('query-response', this._onQueryResponse)
        .on('query-error', this._onQueryError);
    
    let table = this._single.table;
    
    // 获取表的结构并缓存
    if (/[a-zA-Z_0-9]+/.test(table) &&
        this.client.config.tableInfos &&
        !this.client.config.tableInfos[table] &&
        this._method !== 'columnInfo' &&
        isString(table)) {
        try {
            
            let builder = this.client.queryBuilder();
            builder.ctx = this.ctx;
            let tableInfo = await builder
                .table(table)
                .columnInfo();
            this.client.config.tableInfos[table] = tableInfo;
        } catch (ex) {
            console.error(ex);
        }
    }
    const result = this.client.runner(this).run()
    return result.then.apply(result, arguments);
};


/**
 *
 */
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
        
        // select
        if (grouped.columns) {
            grouped.columns.map(function (select) {
                let {
                    value
                } = select;
                (value || []).map((column, index) => {
                    //select[index] = mapping[column] || select[index]
                    if (isString(column)) {
                        value[index] = mapping[column] || value[index]
                        //console.log(column);
                    }
                })
            })
        }
        // where
        if (grouped.where) {
            grouped.where.map(function (where) {
                if (where.column && mapping[where.column]) {
                    where.column = mapping[where.column]
                } else if (where.value instanceof Raw) {
                    let {
                        sql,
                        bindings
                    } = where.value;
                    let index = 0;
                    sql.replace(/\\?\?\??/g, (match) => {
                        if (match === '??') {
                            var value = bindings[index];
                            bindings[index] = mapping[value] || values
                            index++
                        }
                    });
                }
                
                
            })
        }
    }
    return Compiler.toSQL(method || this._method, tz);
}


/**
 * 解析sql文件
 * @param name
 */
builder.prototype.sql = function (name) {
    let {
        module
    } = this.ctx;
    this._mapping = {}
    let sql = get(jinghuan.sql, `${module}.${name}`);
    if (isString(sql)) {
        let lines = sql.split('\n');
        let notes = [];
        let codes = [];
        
        // 解析注解
        for (let i in lines) {
            if (lines[i].startsWith('#')) {
                notes.push(lines[i]);
            } else {
                codes.push(lines[i])
            }
        }
        
        
        for (let i in notes) {
            let [field, mapping] = notes[i].substr(1).split(/\s+/);
            if (field && mapping) {
                this._mapping[field] = mapping
            }
        }
        
        
        sql = codes.join('\n')
        
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

//builder.prototype.transaction = function (container, config) {
//    return new Promise((r, c) => {
//        this.client.transaction((trx) => {
//            r(trx);
//        }).catch((error) => {
//            if (this.client.config.logSql === true) {
//                this.ctx.slog.error(error);
//            }
//        })
//    }, config);
//}


/**
 *
 * @param tableName 表名
 * @param typeName 配置名称
 * @return {knex}
 */
var db = function (tableName = 'jh_table_default', typeName = 'default') {
    
    //数据库配置
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
    
    //hash值对应的 knex 配置
    if (!hasKnex[typeName]) {
        hasKnex[typeName] = knex({
            client: type,
            connection: {
                port,
                host,
                user,
                password,
                database,
            },
            pool: {
                min: min || 0,
                max: max || 255
            },
            logSql,
            tableInfos: {}
        });
    }
    
    // tableName 是 function 时 所有数据库操作都在一个事务中操作
    if (isFunction(tableName)) {
        let _trx;
        let _config = isString(typeName) ? {} : typeName;
        return hasKnex[typeName].transaction(async (trx) => {
                _trx = trx
                return await tableName((tableName2) => {
                    let ret = hasKnex[typeName](tableName2);
                    ret.ctx = this;
                    ret.transacting(trx);
                    return ret;
                });
            }, _config)
            .then((data) => {
                if (config.logSql === true) {
                    this.slog.sql('commit')
                }
                _trx.commit();
                return data;
            })
            .catch((error) => {
                console.error(error);
                if (config.logSql === true) {
                    this.slog.sql(`rollback ${error}`)
                }
                _trx.rollback(error)
            })
        
    }
    else if (isString(tableName)) {
        // 获取一个新实例
        let ret = hasKnex[typeName](tableName);
        ret.ctx = this;
        return ret;
    }
    
};
export default db;

