'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('./util.js');
var cluster = require('cluster');
var helper = require('../../helper');
var debug = require('debug')('JH:cluster/lib/worker[' + process.pid + ']');
var KEEP_ALIVE = Symbol('keep-alive');
var WORKER_RELOAD = Symbol('worker-reload');

/**
 * default options
 */
var defaultOptions = {
    port: 0,
    host: '',
    sticky: false,
    createServer: function createServer() {},
    logger: function logger() {},
    onUncaughtException: function onUncaughtException() {
        return true;
    }, // onUncaughtException event handle
    onUnhandledRejection: function onUnhandledRejection() {
        return true;
    }, // onUnhandledRejection event handle
    processKillTimeout: 10 * 1000 // 10s
};

/**
 * Worker
 */

var Worker = function () {
    /**
     * constructor
     * @param {Object} options
     */
    function Worker(options) {
        _classCallCheck(this, Worker);

        options = util.parseOptions(options);
        this.options = Object.assign({}, defaultOptions, options);
    }

    /**
     * disable keep alive
     */


    Worker.prototype.disableKeepAlive = function disableKeepAlive() {
        if (this[KEEP_ALIVE]) {
            return;
        }
        this[KEEP_ALIVE] = true;
        this.server.on('request', function (req, res) {
            req.shouldKeepAlive = false;
            res.shouldKeepAlive = false;
            if (!res.headersSent) {
                res.setHeader('Connection', 'close');
            }
        });
    };

    /**
     * close server
     */


    Worker.prototype.closeServer = function closeServer() {
        this.disableKeepAlive();
        var killTimeout = this.options.processKillTimeout;
        if (killTimeout) {
            var timer = setTimeout(function () {
                debug('process exit by killed(timeout: ' + killTimeout + 'ms), pid: ' + process.pid);
                process.exit(1);
            }, killTimeout);
            timer.unref && timer.unref();
        }
        var worker = cluster.worker;
        debug('start close server, pid: ' + process.pid);
        this.server.close(function () {
            debug('server closed, pid: ' + process.pid);
            try {
                worker.disconnect();
            } catch (e) {
                debug('already disconnect, pid:' + process.pid);
            }
        });
    };

    /**
     * disconnect worker
     * @param {Boolean} sendSignal
     */


    Worker.prototype.disconnectWorker = function disconnectWorker(sendSignal) {
        var _this = this;

        var worker = cluster.worker;
        // if worker has diconnect, return directly
        if (worker[WORKER_RELOAD]) {
            return;
        }
        worker[WORKER_RELOAD] = true;

        if (sendSignal) {
            worker.send(util.JH_GRACEFUL_DISCONNECT);
            worker.once('message', function (message) {
                if (message === util.JH_GRACEFUL_FORK) {
                    _this.closeServer();
                }
            });
        } else {
            this.closeServer();
        }
    };

    /**
     * capture reload signal
     */


    Worker.prototype.captureReloadSignal = function captureReloadSignal() {
        var _this2 = this;

        process.on('message', function (message) {
            if (message === util.JH_RELOAD_SIGNAL) {
                _this2.disconnectWorker(true);
            }
        });
    };

    /**
     * 捕获 未处理的异常
     */


    Worker.prototype.uncaughtException = function uncaughtException() {
        var _this3 = this;

        var errTimes = 0;
        process.on('uncaughtException', function (err) {
            errTimes++;
            _this3.options.logger('uncaughtException, times: ' + errTimes + ', pid: ' + process.pid);
            _this3.options.logger(err);

            var flag = _this3.options.onUncaughtException(err);
            if (errTimes === 1 && flag) {
                _this3.disconnectWorker(true);
            }
        });
    };

    /**
     * 捕获Promise中未处理的异常
     */


    Worker.prototype.unhandledRejection = function unhandledRejection() {
        var _this4 = this;

        var rejectTimes = 0;
        process.on('unhandledRejection', function (err) {
            rejectTimes++;
            _this4.options.logger('unhandledRejection, times: ' + rejectTimes + ', pid: ' + process.pid);
            _this4.options.logger(err);
            var flag = _this4.options.onUnhandledRejection(err);
            if (rejectTimes === 1 && flag) {
                _this4.disconnectWorker(true);
            }
        });
    };

    /**
     * 监听端口
     */


    Worker.prototype.listen = function listen() {
        var deferred = helper.defer();
        jinghuan.app.listen(this.options.port, this.options.host, function () {
            deferred.resolve();
        });
        return deferred.promise;
    };

    /**
     * 捕获事件
     */


    Worker.prototype.captureEvents = function captureEvents() {
        this.uncaughtException();
        this.unhandledRejection();
        this.captureReloadSignal();
    };

    /**
     * 启动服务
     */


    Worker.prototype.startServer = function startServer() {
        this.captureEvents();
        return this.listen();
    };

    /**
     * get workers
     */


    Worker.prototype.getWorkers = function getWorkers() {
        return process.env.JH_WORKERS;
    };

    return Worker;
}();

module.exports = Worker;