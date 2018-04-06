'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mysql = require('mysql2');
//const _ = require("lodash");
var php = require('locutus/php');
var helper = require('../helper');
var Debounce = require('../debounce');
var debug = require('debug')('mysql');
//
var debounceInstance = new Debounce();

var defaultConfig = {
	port: 3306,
	host: '127.0.0.1',
	user: '',
	password: '',
	database: '',
	connectionLimit: 10
	//multipleStatements: true,
	//logConnect: false,
	//logSql: false
};
var QUERY = Symbol('jinghuan-query');
/**
 * transaction status
 */
var TRANSACTION = {
	start: 1,
	end: 2
};

var hashPool = {};

module.exports = function () {

	/**
  *
  * @param config
  * @param ctx
  */
	function Mysql(config, ctx) {
		_classCallCheck(this, Mysql);

		config = helper.extend({}, defaultConfig, config);
		var hash = php.strings.md5(JSON.stringify(config));

		this.connection = null;
		this.ctx = ctx;
		this.config = config;

		if (!hashPool[hash]) {
			hashPool[hash] = mysql.createPool(config);
			var connectionPath = '';
			if (config.socketPath) {
				connectionPath = config.socketPath;
			} else {
				connectionPath = 'mysql://' + config.user + ':' + config.password + '@' + config.host + ':' + (config.port || 3306) + '/' + config.database;
			}
			this.ctx.slog.info(connectionPath);
		}

		this.pool = hashPool[hash];
	}

	/**
  *
  * @param connection
  * @return {*}
  */


	Mysql.prototype.getConnection = function getConnection(connection) {
		var _this = this;

		if (connection) return Promise.resolve(connection);
		if (this.connection) return Promise.resolve(this.connection);
		return helper.promisify(function (callback) {
			_this.pool.getConnection(function (err, res) {
				callback(err, res);
			});
		}, this)();
	};

	/**
  *
  * @param connection
  */


	Mysql.prototype.releaseConnection = function releaseConnection(connection) {
		//如果不在事务中，则释放连接
		if (connection.transaction !== TRANSACTION.start) {
			this.ctx.slog.debug('release, id=' + connection.threadId);
			//连接可能已经释放
			try {
				connection.release();
			} catch (e) {}
		}
	};

	/**
  * query data
  */


	Mysql.prototype[QUERY] = function (sqlOptions, connection, startTime) {
		var _this2 = this;

		var err = null;
		return helper.promisify(connection.query, connection)(sqlOptions).catch(function (e) {
			err = e;
		}).then(function (data) {
			if (_this2.config.logSql) {
				var endTime = Date.now();
				_this2.ctx.slog.info(sqlOptions.sql + ', Time: ' + (endTime - startTime) + 'ms');
			}
			_this2.releaseConnection(connection);
			if (err) return Promise.reject(err);
			return data;
		});
	};

	/**
  *
  * @param sqlOptions
  * @param connection
  */


	Mysql.prototype.query = function query(sqlOptions, connection) {
		var _this3 = this;

		if (helper.isString(sqlOptions)) {
			sqlOptions = { sql: sqlOptions };
		}
		if (sqlOptions.debounce === undefined) {
			sqlOptions.debounce = true;
		}
		var startTime = Date.now();
		return this.getConnection().then(function (connection) {
			_this3.ctx.slog.debug('connection, id=' + connection.threadId);
			//将事务状态设置为连接
			if (sqlOptions.transaction) {
				if (sqlOptions.transaction === TRANSACTION.start) {
					if (connection.transaction === TRANSACTION.start) return;
				} else if (sqlOptions.transaction === TRANSACTION.end) {
					if (connection.transaction !== TRANSACTION.start) {
						_this3.releaseConnection(connection);
						return;
					}
				}
				connection.transaction = sqlOptions.transaction;
			}

			if (sqlOptions.debounce) {
				var key = JSON.stringify(sqlOptions);
				return debounceInstance.debounce(key, function () {
					return _this3[QUERY](sqlOptions, connection, startTime);
				});
			} else {
				return _this3[QUERY](sqlOptions, connection, startTime);
			}
		});
	};

	/**
  * transaction
  * @param {Function} fn
  * @param {Object} connection
  */


	Mysql.prototype.startTrans = function startTrans(fn, connection) {
		var _this4 = this;

		return this.getConnection(connection).then(function (connection) {
			_this4.connection = connection;
			return _this4.query({
				sql: 'START TRANSACTION',
				transaction: TRANSACTION.start,
				debounce: false
			}, connection).then(function () {
				return connection;
			});
		});
	};

	/**
  * rollback transaction
  * @param {Object} connection
  */


	Mysql.prototype.rollback = function rollback(connection) {
		return this.query({
			sql: 'ROLLBACK',
			transaction: TRANSACTION.end,
			debounce: false
		}, connection);
	};

	/**
  * commit transaction
  * @param {Object} connection
  */


	Mysql.prototype.commit = function commit(connection) {
		return this.query({
			sql: 'COMMIT',
			transaction: TRANSACTION.end,
			debounce: false
		}, connection);
	};

	/**
  * execute
  * @param  {Array} args []
  * @returns {Promise}
  */


	Mysql.prototype.execute = function execute(sqlOptions, connection) {
		if (helper.isString(sqlOptions)) {
			sqlOptions = { sql: sqlOptions };
		}
		sqlOptions.debounce = false;
		return this.query(sqlOptions);
	};

	return Mysql;
}();