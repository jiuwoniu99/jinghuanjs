const helper = require('../helper');
const knex = require('knex');
const builder = require('knex/lib/query/builder');
//const _ = require('lodash');
const JSSQLLexer = require('./lib/lexer/JSSQLLexer');
//

const hasKnex = {};

/**
 *
 */
builder.prototype.clear = function() {
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
builder.prototype._onStart = function(data) {
    //console.log('_onStart')
};

/**
 *
 * @param data
 * @private
 */
builder.prototype._onEnd = function(data) {
    //console.log('_onEnd')
};

/**
 * 查询事件 查询之前触发
 * @param data
 * @private
 */
builder.prototype._onQuery = function(data) {
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
 * @param obj
 * @param builder
 * @private
 */
builder.prototype._onQueryResponse = function(response, data, builder) {
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
builder.prototype._onQueryError = function(error, obj) {
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
builder.prototype.context = function(ctx, knex) {
    this.ctx = ctx;
    this._knex = knex;
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
builder.prototype.clone = function() {
    return clone.call(this).context(this.ctx, this._knex);
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
builder.prototype.then = async function() {
    this.on('start', this._onStart)
    .on('end', this._onEnd)
    .on('query', this._onQuery)
    .on('query-response', this._onQueryResponse)
    .on('query-error', this._onQueryError);

    let table = this._single.table;
    let builder = this.client.queryBuilder();

    // 获取表的结构并缓存
    if (this.client.config.fields
        && !this.client.config.fields[table]
        && this._method !== 'columnInfo'
        && helper.isString(table)) {
        try {
            this.client.config.fields[table] = await builder
            .table(table)
            .context(this.ctx)
            .columnInfo();
        } catch (ex) {

        }
    }

    return then.apply(this, arguments);
};

/**
 * 解析已
 * @param name
 */
builder.prototype.sql = function(name) {
    let {module} = this.ctx;
    if (jinghuan.app.sql && jinghuan.app.sql[module] && jinghuan.app.sql[module][name]) {
        let sql = jinghuan.app.sql[module][name];
        let lexer = new JSSQLLexer();
        let tokens = lexer.split(sql);

        this.from(this._knex.raw('(' + sql + ') as jh_table', []));
    }
    return this;
};

/**
 *
 * @param tableName 表名
 * @param typeName 配置名称
 */
module.exports = function(tableName = null, typeName = 'default') {

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
