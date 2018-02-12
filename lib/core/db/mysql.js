const mysql = require('mysql2');
const _ = require("lodash");
const php = require('locutus/php');
const helper = require('../helper')
const Debounce = require('../debounce');
const debug = require('debug')('mysql');
//
const debounceInstance = new Debounce();

const defaultConfig = {
	port: 3306,
	host: '127.0.0.1',
	user: '',
	password: '',
	database: '',
	connectionLimit: 10,
	//multipleStatements: true,
	//logConnect: false,
	//logSql: false
};
const QUERY = Symbol('jinghuan-query');
/**
 * transaction status
 */
const TRANSACTION = {
	start: 1,
	end: 2
};

const hashPool = {};

module.exports = class Mysql {

	/**
	 *
	 * @param config
	 * @param ctx
	 */
	constructor(config, ctx) {
		config = _.extend({}, defaultConfig, config);
		let hash = php.strings.md5(JSON.stringify(config));

		this.connection = null;
		this.ctx = ctx;
		this.config = config;

		if (!hashPool[hash]) {
			hashPool[hash] = mysql.createPool(config);
			let connectionPath = '';
			if (config.socketPath) {
				connectionPath = config.socketPath;
			} else {
				connectionPath = `mysql://${config.user}:${config.password}@${config.host}:${config.port || 3306}/${config.database}`;
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
	getConnection(connection) {
		if (connection) return Promise.resolve(connection);
		if (this.connection) return Promise.resolve(this.connection);
		return helper.promisify((callback) => {
			this.pool.getConnection((err, res) => {
				callback(err, res)
			})
		}, this)();
	}

	/**
	 *
	 * @param connection
	 */
	releaseConnection(connection) {
		//如果不在事务中，则释放连接
		if (connection.transaction !== TRANSACTION.start) {
			this.ctx.slog.debug('release, id=' + connection.threadId);
			//连接可能已经释放
			try {
				connection.release();
			} catch (e) {
			}
		}
	}

	/**
	 * query data
	 */
	[QUERY](sqlOptions, connection, startTime) {
		let err = null;
		return helper.promisify(connection.query, connection)(sqlOptions).catch(e => {
			err = e;
		}).then(data => {
			if (this.config.logSql) {
				let endTime = Date.now();
				this.ctx.slog.info(`${sqlOptions.sql}, Time: ${endTime - startTime}ms`);
			}
			this.releaseConnection(connection);
			if (err) return Promise.reject(err);
			return data;
		});
	}

	/**
	 *
	 * @param sqlOptions
	 * @param connection
	 */
	query(sqlOptions, connection) {
		if (helper.isString(sqlOptions)) {
			sqlOptions = {sql: sqlOptions};
		}
		if (sqlOptions.debounce === undefined) {
			sqlOptions.debounce = true;
		}
		let startTime = Date.now();
		return this.getConnection().then(connection => {
			this.ctx.slog.debug('connection, id=' + connection.threadId);
			//将事务状态设置为连接
			if (sqlOptions.transaction) {
				if (sqlOptions.transaction === TRANSACTION.start) {
					if (connection.transaction === TRANSACTION.start) return;
				} else if (sqlOptions.transaction === TRANSACTION.end) {
					if (connection.transaction !== TRANSACTION.start) {
						this.releaseConnection(connection);
						return;
					}
				}
				connection.transaction = sqlOptions.transaction;
			}

			if (sqlOptions.debounce) {
				let key = JSON.stringify(sqlOptions);
				return debounceInstance.debounce(key, () => {
					return this[QUERY](sqlOptions, connection, startTime);
				});
			} else {
				return this[QUERY](sqlOptions, connection, startTime);
			}
		});
	}

	/**
	 * transaction
	 * @param {Function} fn
	 * @param {Object} connection
	 */
	startTrans(fn, connection) {
		return this.getConnection(connection).then(connection => {
			this.connection = connection;
			return this.query({
				sql: 'START TRANSACTION',
				transaction: TRANSACTION.start,
				debounce: false
			}, connection).then(() => connection);
		});
	}

	/**
	 * rollback transaction
	 * @param {Object} connection
	 */
	rollback(connection) {
		return this.query({
			sql: 'ROLLBACK',
			transaction: TRANSACTION.end,
			debounce: false,
		}, connection);
	}

	/**
	 * commit transaction
	 * @param {Object} connection
	 */
	commit(connection) {
		return this.query({
			sql: 'COMMIT',
			transaction: TRANSACTION.end,
			debounce: false,
		}, connection);
	}

	/**
	 * execute
	 * @param  {Array} args []
	 * @returns {Promise}
	 */
	execute(sqlOptions, connection) {
		if (helper.isString(sqlOptions)) {
			sqlOptions = {sql: sqlOptions};
		}
		sqlOptions.debounce = false;
		return this.query(sqlOptions);
	}
}
