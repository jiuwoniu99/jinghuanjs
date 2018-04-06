'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cluster = require('cluster');
var util = require('./util.js');
var net = require('net');
var stringHash = require('string-hash');

var waitReloadWorkerTimes = 0;

/**
 * default options
 */
var defaultOptions = {
    port: 0, // server listen port
    host: '', // server listen host
    sticky: false, // sticky cluster
    getRemoteAddress: function getRemoteAddress(socket) {
        return socket.remoteAddress;
    },
    workers: 0, // fork worker nums
    reloadSignal: '' // reload workers signal
};

/**
 * Master class
 */

var Master = function () {
    /**
     * constructor
     * @param {Object} options
     */
    function Master(options) {
        _classCallCheck(this, Master);

        options = util.parseOptions(options);
        this.options = Object.assign({}, defaultOptions, options);
    }

    /**
     * capture reload signal
     */


    Master.prototype.captureReloadSignal = function captureReloadSignal() {
        var signal = this.options.reloadSignal;
        var reloadWorkers = function reloadWorkers() {
            util.getAliveWorkers().forEach(function (worker) {
                return worker.send(util.JH_RELOAD_SIGNAL);
            });
        };
        if (signal) process.on(signal, reloadWorkers);

        // if receive message `jinghuan-cluster-reload-workers` from worker, restart all workers
        cluster.on('message', function (worker, message) {
            if (message !== 'jinghuan-cluster-reload-workers') return;
            reloadWorkers();
        });
    };

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
        this.captureReloadSignal();
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

    /**
     * force reload all workers when code is changed, in development env
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

        // check alive workers has leak
        var allowWorkers = this.options.workers;
        if (aliveWorkers.length > allowWorkers) {
            console.error('workers fork has leak, alive workers: ' + aliveWorkers.length + ', need workers: ' + this.options.workers);
        }

        var firstWorker = aliveWorkers.shift();
        var promise = util.forkWorker(this.getForkEnv()).then(function (data) {
            _this.sendInspectPort(data.worker);
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
     * create server with sticky
     * https://github.com/uqee/sticky-cluster
     */


    Master.prototype.createServer = function createServer() {
        var _this2 = this;

        var deferred = jinghuan.defer();
        var server = net.createServer({ pauseOnConnect: true }, function (socket) {
            var remoteAddress = _this2.options.getRemoteAddress(socket) || '';
            var index = stringHash(remoteAddress) % _this2.options.workers;
            var idx = -1;
            util.getAliveWorkers().some(function (worker) {
                if (index === ++idx) {
                    worker.send(util.JH_STICKY_CLUSTER, socket);
                    return true;
                }
            });
        });
        server.listen(this.options.port, this.options.host, function () {
            _this2.forkWorkers().then(function (data) {
                deferred.resolve(data);
            });
        });
        return deferred.promise;
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
     * start server, support sticky
     */


    Master.prototype.startServer = function startServer() {
        var _this3 = this;

        var promise = !this.options.sticky ? this.forkWorkers() : this.createServer();
        return promise.then(function (data) {
            _this3.sendInspectPort(data[0].worker);
            return data;
        });
    };

    return Master;
}();

module.exports = Master;