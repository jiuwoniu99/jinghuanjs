'use strict';

var _mysql = require('knex/lib/dialects/mysql2');

var _mysql2 = _interopRequireDefault(_mysql);

var _mysql3 = require('knex/lib/dialects/mysql');

var _mysql4 = _interopRequireDefault(_mysql3);

var _mssql = require('knex/lib/dialects/mssql');

var _mssql2 = _interopRequireDefault(_mssql);

var _oracle = require('knex/lib/dialects/oracle');

var _oracle2 = _interopRequireDefault(_oracle);

var _postgres = require('knex/lib/dialects/postgres');

var _postgres2 = _interopRequireDefault(_postgres);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mysql2.default.prototype._driver = function _driver() {
    try {
        return _safeRequire(require.resolve('mysql2', { paths: jinghuan.paths }));
    } catch (e) {
        jinghuan.logger.error('npm install mysql2');
        return null;
    }
};

_mysql4.default.prototype._driver = function _driver() {
    try {
        return _safeRequire(require.resolve('mysql', { paths: jinghuan.paths }));
    } catch (e) {
        jinghuan.logger.error('npm install mysql');
        return null;
    }
};

_mssql2.default.prototype._driver = function _driver() {
    try {
        return _safeRequire(require.resolve('mssql', { paths: jinghuan.paths }));
    } catch (e) {
        jinghuan.logger.error('npm install mssql');
        return null;
    }
};

_oracle2.default.prototype._driver = function _driver() {
    try {
        return _safeRequire(require.resolve('oracle', { paths: jinghuan.paths }));
    } catch (e) {
        jinghuan.logger.error('npm install mssql');
        return null;
    }
};

_postgres2.default.prototype._driver = function _driver() {
    try {
        return _safeRequire(require.resolve('oracle', { paths: jinghuan.paths }));
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