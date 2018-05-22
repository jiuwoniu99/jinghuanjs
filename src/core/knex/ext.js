import mysql2 from 'knex/lib/dialects/mysql2';
import mysql from 'knex/lib/dialects/mysql';
import mssql from 'knex/lib/dialects/mssql';
import oracle from 'knex/lib/dialects/oracle';
import postgres from 'knex/lib/dialects/postgres';
//import compiler from 'knex/lib/query/compiler'


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

