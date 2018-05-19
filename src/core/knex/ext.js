import mysql2 from 'knex/lib/dialects/mysql2';
import mysql from 'knex/lib/dialects/mysql';
import mssql from 'knex/lib/dialects/mssql';
import oracle from 'knex/lib/dialects/oracle';
import postgres from 'knex/lib/dialects/postgres';
import compiler from 'knex/lib/query/compiler'


//compiler.prototype.columns = function () {
//    var distinct = false;
//    if (this.onlyUnions()) return '';
//    var columns = this.grouped.columns || [];
//    var i = -1,
//        sql = [];
//    if (columns) {
//        while (++i < columns.length) {
//            var stmt = columns[i];s
//            if (stmt.distinct) distinct = true;
//            if (stmt.type === 'aggregate') {
//                sql.push(this.aggregate(stmt));
//            } else if (stmt.type === 'aggregateRaw') {
//                sql.push(this.aggregateRaw(stmt));
//            } else if (stmt.value && stmt.value.length > 0) {
//                sql.push(this.formatter.columnize(stmt.value));
//            }
//        }
//    }
//    if (sql.length === 0) sql = ['*'];
//    return 'select ' + (distinct ? 'distinct ' : '') + sql.join(', ') + (this.tableName ? ' from ' + (this.single.only ? 'only ' : '') + this.tableName : '');
//}


/**
 *
 * @return {*}
 * @private
 */
mysql2.prototype._driver = function _driver() {
    try {
        return require(require.resolve('mysql2', {paths: jinghuan.paths}));
    } catch (e) {
        jinghuan.logger.error('npm install mysql2')
        return null;
    }
}

/**
 *
 * @return {*}
 * @private
 */
mysql.prototype._driver = function _driver() {
    try {
        return require(require.resolve('mysql', {paths: jinghuan.paths}));
    } catch (e) {
        jinghuan.logger.error('npm install mysql')
        return null;
    }
}

/**
 *
 * @return {*}
 * @private
 */
mssql.prototype._driver = function _driver() {
    try {
        return require(require.resolve('mssql', {paths: jinghuan.paths}));
    } catch (e) {
        jinghuan.logger.error('npm install mssql')
        return null;
    }
}

/**
 *
 * @return {*}
 * @private
 */
oracle.prototype._driver = function _driver() {
    try {
        return require(require.resolve('oracle', {paths: jinghuan.paths}));
    } catch (e) {
        jinghuan.logger.error('npm install mssql')
        return null;
    }
}

/**
 *
 * @return {*}
 * @private
 */
postgres.prototype._driver = function _driver() {
    try {
        return require(require.resolve('oracle', {paths: jinghuan.paths}));
    } catch (e) {
        jinghuan.logger.error('npm install pg')
        return null;
    }
}

