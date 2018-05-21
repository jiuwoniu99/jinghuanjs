'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const util = _safeRequire('./util.js');

let waitReloadWorkerTimes = 0;

const defaultOptions = {
    port: 0,
    host: '',
    workers: 0
};

let Master = class Master {
    constructor(options) {
        let port = jinghuan.PORT;
        let host = jinghuan.HOST;
        let workers = jinghuan.workers;

        this.options = { port, host, workers };
    }

    forkWorkers() {
        const workers = this.options.workers;
        let index = 0;
        const promises = [];
        while (index++ < workers) {
            const promise = util.forkWorker(this.getEnv());
            promises.push(promise);
        }
        return Promise.all(promises);
    }

    getEnv() {
        return {};
    }

    startServer() {
        this.forkWorkers();
    }

    forceReloadWorkers() {
        if (waitReloadWorkerTimes) {
            waitReloadWorkerTimes++;
            return;
        }

        jinghuan.logger.info(`[Cluster] Reload Workers`);

        waitReloadWorkerTimes = 1;

        const aliveWorkers = util.getAliveWorkers();

        if (!aliveWorkers.length) return;

        if (aliveWorkers.length > this.options.workers) {
            console.error(`workers fork has leak, alive workers: ${aliveWorkers.length}, need workers: ${this.options.workers}`);
        }

        const firstWorker = aliveWorkers.shift();

        const promise = util.forkWorker();

        promise.then(data => {

            this.sendInspectPort(data.worker);

            this.killWorker(firstWorker, true);

            return aliveWorkers.map(worker => {
                this.killWorker(worker, true);
                return util.forkWorker();
            });
        });

        return promise.then(() => {
            if (waitReloadWorkerTimes > 1) {
                waitReloadWorkerTimes = 0;
                this.forceReloadWorkers();
            } else {
                waitReloadWorkerTimes = 0;
            }
        });
    }

    sendInspectPort(worker) {
        if (!process.send) return;
        const inspect = process.execArgv.some(item => item.indexOf('--inspect') >= 0);
        if (!inspect) return;
        const spawnargs = worker.process.spawnargs;
        let port;
        spawnargs.some(item => {
            let match;
            if (item.indexOf('--inspect') >= 0 && (match = item.match(/\d+/))) {
                port = match[0];
            }
        });
        if (port) {
            process.send({ act: 'inspectPort', port });
        }
    }

    killWorker(worker, reload) {
        if (reload) worker[util.WORKER_REALOD] = true;
        worker.kill('SIGINT');
        worker[util.NEED_KILLED] = true;
        setTimeout(function () {
            if (!worker.isConnected()) return;
            worker.process.kill('SIGINT');
        }, 100);
    }
};
exports.default = Master;

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}