"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require("./util.js");

var _util2 = _interopRequireDefault(_util);

var _cluster = require("cluster");

var _cluster2 = _interopRequireDefault(_cluster);

var _helper = require("../../helper");

var _helper2 = _interopRequireDefault(_helper);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)(`JH:cluster/lib/worker[${process.pid}]`);
const KEEP_ALIVE = Symbol('keep-alive');
const WORKER_RELOAD = Symbol('worker-reload');

const defaultOptions = {
    port: 0,
    host: '',
    sticky: false,
    createServer: () => {},
    onUncaughtException: () => true,
    onUnhandledRejection: () => true,
    processKillTimeout: 10 * 1000 };

let Worker = class Worker {
    constructor(options) {
        const port = jinghuan.PORT;
        const host = jinghuan.HOST;

        const processKillTimeout = jinghuan.config('processKillTimeout');

        const onUncaughtException = jinghuan.config('onUncaughtException');

        const onUnhandledRejection = jinghuan.config('onUnhandledRejection');

        options = _util2.default.parseOptions({ port, host, processKillTimeout, onUncaughtException, onUnhandledRejection });

        this.options = Object.assign({}, defaultOptions, options);
    }

    disableKeepAlive() {
        if (this[KEEP_ALIVE]) {
            return;
        }
        this[KEEP_ALIVE] = true;
        this.server.on('request', (req, res) => {
            req.shouldKeepAlive = false;
            res.shouldKeepAlive = false;
            if (!res.headersSent) {
                res.setHeader('Connection', 'close');
            }
        });
    }

    closeServer() {
        this.disableKeepAlive();
        const killTimeout = this.options.processKillTimeout;
        if (killTimeout) {
            const timer = setTimeout(() => {
                log(`process exit by killed(timeout: ${killTimeout}ms), pid: ${process.pid}`);
                process.exit(1);
            }, killTimeout);
            timer.unref && timer.unref();
        }
        const worker = _cluster2.default.worker;
        log(`start close server, pid: ${process.pid}`);

        this.server.close(() => {
            log(`server closed, pid: ${process.pid}`);
            try {
                worker.disconnect();
            } catch (e) {
                log(`already disconnect, pid:${process.pid}`);
            }
        });
    }

    disconnectWorker(sendSignal) {
        const worker = _cluster2.default.worker;

        if (worker[WORKER_RELOAD]) {
            return;
        }
        worker[WORKER_RELOAD] = true;

        jinghuan.logger.info(`[Worker] Reload`);

        if (sendSignal) {
            worker.send(_util2.default.JH_GRACEFUL_DISCONNECT);

            worker.once('message', message => {
                if (message === _util2.default.JH_GRACEFUL_FORK) {
                    this.closeServer();
                }
            });
        } else {
            this.closeServer();
        }
    }

    captureReloadSignal() {
        process.on('message', message => {
            if (message === _util2.default.JH_RELOAD_SIGNAL) {
                this.disconnectWorker(true);
            }
        });
    }

    uncaughtException() {
        let errTimes = 0;
        process.on('uncaughtException', err => {
            errTimes++;
            jinghuan.logger.error(`uncaughtException, times: ${errTimes}, pid: ${process.pid}`);
            jinghuan.logger.error(err);

            const flag = this.options.onUncaughtException(err);
            if (errTimes === 1 && flag) {
                this.disconnectWorker(true);
            }
        });
    }

    unhandledRejection() {
        let rejectTimes = 0;
        process.on('unhandledRejection', err => {
            rejectTimes++;
            jinghuan.logger.error(`unhandledRejection, times: ${rejectTimes}, pid: ${process.pid}`);
            jinghuan.logger.error(err);
            const flag = this.options.onUnhandledRejection(err);
            if (rejectTimes === 1 && flag) {
                this.disconnectWorker(true);
            }
        });
    }

    listen() {
        const deferred = _helper2.default.defer();
        jinghuan.app.listen(this.options.port, this.options.host, () => {
            deferred.resolve();
        });
        return deferred.promise;
    }

    captureEvents() {
        this.uncaughtException();
        this.unhandledRejection();
        this.captureReloadSignal();
    }

    startServer() {
        this.captureEvents();
        return this.listen();
    }

    getWorkers() {
        return process.env.JH_WORKERS;
    }
};
exports.default = Worker;