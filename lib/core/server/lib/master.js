'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cluster = require('cluster');
var util = require('./util.js');
var net = require('net');
var stringHash = require('string-hash');
var redis = require('redis');

var waitReloadWorkerTimes = 0;

/**
 * 默认参数
 */
var defaultOptions = {
    port: 0, // server listen port
    host: '', // server listen host
    workers: 0 // fork worker nums
};

/**
 * Master class
 */

var Master = function () {

    /**
     *
     * @param options
     */
    function Master(options) {
        _classCallCheck(this, Master);

        options = util.parseOptions(options);
        this.options = Object.assign({}, defaultOptions, options);
    }

    /**
     * get fork env
     */


    Master.prototype.getForkEnv = function getForkEnv() {
        return {
            JH_WORKERS: this.options.workers // workers num
        };
    };

    /**
     * fork workers
     */


    Master.prototype.forkWorkers = function forkWorkers() {
        var workers = this.options.workers;
        var index = 0;
        var promises = [];
        while (index++ < workers) {
            var env = Object.assign({}, this.getForkEnv());
            var promise = util.forkWorker(env);
            promises.push(promise);
        }
        return Promise.all(promises);
    };

    /**
     * start server, support sticky
     */


    Master.prototype.startServer = function startServer() {
        this.forkWorkers();
    };

    /**
     * 强制重新加载
     * 在开发环境中强制重新加载所有的worker
     */


    Master.prototype.forceReloadWorkers = function forceReloadWorkers() {
        var _this = this;

        if (waitReloadWorkerTimes) {
            waitReloadWorkerTimes++;
            return;
        }
        waitReloadWorkerTimes = 1;

        var aliveWorkers = util.getAliveWorkers();

        if (!aliveWorkers.length) return;

        if (aliveWorkers.length > this.options.workers) {
            console.error('workers fork has leak, alive workers: ' + aliveWorkers.length + ', need workers: ' + this.options.workers);
        }

        var firstWorker = aliveWorkers.shift();

        var promise = util.forkWorker(this.getForkEnv()).then(function (data) {
            // this.sendInspectPort(data.worker);
            // http://man7.org/linux/man-pages/man7/signal.7.html
            _this.killWorker(firstWorker, true);

            return aliveWorkers.map(function (worker) {
                _this.killWorker(worker, true);
                return util.forkWorker(_this.getForkEnv());
            });
        });

        return promise.then(function () {
            if (waitReloadWorkerTimes > 1) {
                waitReloadWorkerTimes = 0;
                _this.forceReloadWorkers();
            } else {
                waitReloadWorkerTimes = 0;
            }
        });
    };

    /**
     * send inspect port
     * @param {Worker} worker
     */


    Master.prototype.sendInspectPort = function sendInspectPort(worker) {
        if (!process.send) return;
        var inspect = process.execArgv.some(function (item) {
            return item.indexOf('--inspect') >= 0;
        });
        if (!inspect) return;
        var spawnargs = worker.process.spawnargs;
        var port = void 0;
        spawnargs.some(function (item) {
            var match = void 0;
            if (item.indexOf('--inspect') >= 0 && (match = item.match(/\d+/))) {
                port = match[0];
            }
        });
        if (port) {
            process.send({ act: 'inspectPort', port: port });
        }
    };

    /**
     * kill worker
     */


    Master.prototype.killWorker = function killWorker(worker, reload) {
        if (reload) worker[util.WORKER_REALOD] = true;
        worker.kill('SIGINT'); // windows don't support SIGQUIT
        worker[util.NEED_KILLED] = true;
        setTimeout(function () {
            if (!worker.isConnected()) return;
            worker.process.kill('SIGINT');
        }, 100);
    };

    return Master;
}();

module.exports = Master;