const mysql2 = require('knex/lib/dialects/mysql2');
const mysql = require('knex/lib/dialects/mysql');
const mssql = require('knex/lib/dialects/mssql');
const oracle = require('knex/lib/dialects/oracle');
const postgres = require('knex/lib/dialects/postgres');

//module.paths.push(jinghuan.paths[0]);
//module.paths.push(jinghuan.paths[1]);

/**
 *
 * @return {*}
 * @private
 */
mysql2.prototype._driver = function _driver() {
    try {
        return require(require.resolve('mysql2', {paths:jinghuan.paths}));
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
        return require(require.resolve('mysql', {paths:jinghuan.paths}));
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
        return require(require.resolve('mssql', {paths:jinghuan.paths}));
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
        return require(require.resolve('oracle', {paths:jinghuan.paths}));
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
        return require(require.resolve('oracle', {paths:jinghuan.paths}));
    } catch (e) {
        jinghuan.logger.error('npm install pg')
        return null;
    }
}

