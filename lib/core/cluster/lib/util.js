'use strict';

var cluster = require('cluster');
var helper = require('../../helper');

var cpus = require('os').cpus().length;
var debug = require('debug')('jinghuan-cluster');
var WORKER_REALOD = Symbol('worker-reload');
var NEED_KILLED = Symbol('need-killed');

var thinkProcessId = 1;

exports.JH_RELOAD_SIGNAL = 'jinghuan-reload-signal';
exports.JH_GRACEFUL_FORK = 'jinghuan-graceful-fork';
exports.JH_GRACEFUL_DISCONNECT = 'jinghuan-graceful-disconnect';
exports.JH_STICKY_CLUSTER = 'jinghuan-sticky-cluster';
exports.WORKER_REALOD = WORKER_REALOD;
exports.NEED_KILLED = NEED_KILLED;

/**
 * parse options
 */
exports.parseOptions = function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    options.workers = options.workers || cpus;
    return options;
};
/**
 * check worker is alive
 */
exports.isAliveWorker = function (worker) {
    var state = worker.state;
    if (state === 'disconnected' || state === 'dead') return false;
    if (worker[NEED_KILLED] || worker[WORKER_REALOD]) return false;
    return true;
};
/**
 * get alive workers
 */
exports.getAliveWorkers = function () {
    var workers = [];
    for (var id in cluster.workers) {
        var worker = cluster.workers[id];
        if (!exports.isAliveWorker(worker)) continue;
        workers.push(worker);
    }
    return workers;
};

/**
 * fork worker
 */
exports.forkWorker = function () {
    var env = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var deferred = helper.defer();
    env.JH_PROCESS_ID = thinkProcessId++;
    var worker = cluster.fork(env);
    worker.on('message', function (message) {
        if (worker[WORKER_REALOD]) return;
        if (message === exports.JH_GRACEFUL_DISCONNECT) {
            debug('refork worker, receive message \'jinghuan-graceful-disconnect\'');
            worker[WORKER_REALOD] = true;
            exports.forkWorker(env).then(function () {
                return worker.send(exports.JH_GRACEFUL_FORK);
            });
        }
    });
    worker.once('disconnect', function () {
        if (worker[WORKER_REALOD]) return;
        debug('worker disconnect');
        worker[WORKER_REALOD] = true;
        exports.forkWorker(env);
    });
    worker.once('exit', function (code, signal) {
        if (worker[WORKER_REALOD]) return;
        debug('worker exit, code:' + code + ', signal:' + signal);
        worker[WORKER_REALOD] = true;
        exports.forkWorker(env);
    });
    worker.once('listening', function (address) {
        // add prev pid to process.env
        env.JH_PREV_PID = worker.process.pid;
        deferred.resolve({ worker: worker, address: address });
    });
    return deferred.promise;
};