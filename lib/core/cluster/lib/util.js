"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _cluster = require("cluster");

var _cluster2 = _interopRequireDefault(_cluster);

var _helper = require("../../helper");

var _helper2 = _interopRequireDefault(_helper);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cpus = _safeRequire('os').cpus().length;
const WORKER_REALOD = Symbol('worker-reload');
const NEED_KILLED = Symbol('need-killed');
const log = (0, _debug2.default)(`JH:core/server/lib/util[${process.pid}]`);
const util = {};

let jhProcessId = 1;

util.JH_RELOAD_SIGNAL = 'jinghuan-reload-signal';

util.JH_GRACEFUL_FORK = 'jinghuan-graceful-fork';

util.JH_GRACEFUL_DISCONNECT = 'jinghuan-graceful-disconnect';

util.JH_STICKY_CLUSTER = 'jinghuan-sticky-cluster';

util.WORKER_REALOD = WORKER_REALOD;
util.NEED_KILLED = NEED_KILLED;

util.parseOptions = function (options = {}) {
    options.workers = options.workers || cpus;
    return options;
};

util.isAliveWorker = worker => {
    const state = worker.state;
    if (state === 'disconnected' || state === 'dead') return false;
    if (worker[NEED_KILLED] || worker[WORKER_REALOD]) return false;
    return true;
};

util.getAliveWorkers = () => {
    const workers = [];
    for (const id in _cluster2.default.workers) {
        const worker = _cluster2.default.workers[id];
        if (!util.isAliveWorker(worker)) continue;
        workers.push(worker);
    }
    return workers;
};

util.forkWorker = function (env = {}) {
    const deferred = _helper2.default.defer();

    env.JH_PROCESS_ID = jhProcessId++;

    const worker = _cluster2.default.fork(env);

    worker.on('message', message => {
        if (worker[WORKER_REALOD]) return;

        if (message === util.JH_GRACEFUL_DISCONNECT) {

            log(`refork worker, receive message '${util.JH_GRACEFUL_DISCONNECT}'`);
            worker[WORKER_REALOD] = true;

            util.forkWorker(env).then(() => {
                worker.send(util.JH_GRACEFUL_FORK);
            });
        }
    });

    worker.once('online', () => {
        log(`worker online`);
    });

    worker.once('disconnect', () => {
        if (worker[WORKER_REALOD]) return;
        log(`worker disconnect`);
        worker[WORKER_REALOD] = true;
        util.forkWorker(env);
    });

    worker.once('exit', (code, signal) => {
        if (worker[WORKER_REALOD]) return;
        log(`worker exit, code:${code}, signal:${signal}`);
        worker[WORKER_REALOD] = true;
        util.forkWorker(env);
    });

    worker.once('listening', address => {
        env.JH_PREV_PID = worker.process.pid;
        deferred.resolve({ worker, address });
    });

    return deferred.promise;
};

exports.default = util;

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