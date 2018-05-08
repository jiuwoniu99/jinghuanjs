import knex from "knex"
import builder from "knex/lib/query/builder"
import {
    assign, bind, compact, groupBy, isEmpty, isString, isUndefined, map, omitBy,
    reduce
} from 'lodash';
import strtolower from 'locutus/php/strings/strtolower';
import trim from 'locutus/php/strings/trim';
import debug from 'debug';
import JSSQLLexer from './lib/lexer/JSSQLLexer';

const log = debug('code.knex');
const hasKnex = {};

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
    //console.log('_onQuery')
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
                //throw new Error(`The sql [${data.sql}] statement lacks the [where] condition`)
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
    return clone.call(this).context(this.ctx);
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
    
    for (let idx in this._statements) {
        let _state = this._statements[idx];
        let {column, grouping, value} = _state;
        
        // _mapping字段映射只针对查询字段和查询条件
        switch (grouping) {
            case "columns":
                for (let i in value) {
                    if (isString(value[i])) {
                        let [field, asField] = value[i].split(' as ');
                        if (this._mapping && this._mapping[field]) {
                            value[i] = this._mapping[field] + (asField ? ` as ${asField}` : '')
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
    
    const result = this.client.runner(this).run()
    return result.then.apply(result, arguments);
};

/**
 * 解析已
 * @param name
 */
builder.prototype.sql = function (name) {
    let {module} = this.ctx;
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
export default function (tableName = null, typeName = 'default') {
    
    //数据库配置
    let config = jinghuan.config(`database.${typeName}`);
    let {type, port, host, user, password, database, min, max, logSql} = config;
    
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
            pool: {min: min || 0, max: max || 255},
            logSql,
            fields: {}
            //debug: true
        });
    }
    
    /**
     *
     */
    return hasKnex[typeName](tableName).context(this, hasKnex[typeName]);
};
