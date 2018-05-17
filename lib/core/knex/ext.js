'use strict';

const mysql2 = _safeRequire('knex/lib/dialects/mysql2');
const mysql = _safeRequire('knex/lib/dialects/mysql');
const mssql = _safeRequire('knex/lib/dialects/mssql');
const oracle = _safeRequire('knex/lib/dialects/oracle');
const postgres = _safeRequire('knex/lib/dialects/postgres');

mysql2.prototype._driver = function _driver() {
    try {
        return _safeRequire(require.resolve('mysql2', jinghuan.requireResolve));
    } catch (e) {
        jinghuan.logger.error('npm install mysql2');
        return null;
    }
};

mysql.prototype._driver = function _driver() {
    try {
        return _safeRequire(require.resolve('mysql', jinghuan.requireResolve));
    } catch (e) {
        jinghuan.logger.error('npm install mysql');
        return null;
    }
};

mssql.prototype._driver = function _driver() {
    try {
        return _safeRequire(require.resolve('mssql', jinghuan.requireResolve));
    } catch (e) {
        jinghuan.logger.error('npm install mssql');
        return null;
    }
};

oracle.prototype._driver = function _driver() {
    try {
        return _safeRequire(require.resolve('oracle', jinghuan.requireResolve));
    } catch (e) {
        jinghuan.logger.error('npm install mssql');
        return null;
    }
};

postgres.prototype._driver = function _driver() {
    try {
        return _safeRequire(require.resolve('oracle', jinghuan.requireResolve));
    } catch (e) {
        jinghuan.logger.error('npm install pg');
        return null;
    }
};

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule ? obj.default : obj;
}