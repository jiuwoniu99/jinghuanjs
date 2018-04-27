const cluster = require('cluster');
const helper = require('../../helper');

const cpus = require('os').cpus().length;
const debug = require('debug')(`JH:core/server/lib/util[${process.pid}]`);
const WORKER_REALOD = Symbol('worker-reload');
const NEED_KILLED = Symbol('need-killed');

let jhProcessId = 1;

exports.JH_RELOAD_SIGNAL = 'jinghuan-reload-signal';
exports.JH_GRACEFUL_FORK = 'jinghuan-graceful-fork';
exports.JH_GRACEFUL_DISCONNECT = 'jinghuan-graceful-disconnect';
exports.JH_STICKY_CLUSTER = 'jinghuan-sticky-cluster';
exports.WORKER_REALOD = WORKER_REALOD;
exports.NEED_KILLED = NEED_KILLED;

/**
 * parse options
 */
exports.parseOptions = function (options = {}) {
    options.workers = options.workers || cpus;
    return options;
};

/**
 * 检查worker是否处于活动状态
 * @param worker
 * @return {boolean}
 */
exports.isAliveWorker = worker => {
    const state = worker.state;
    if (state === 'disconnected' || state === 'dead') return false;
    if (worker[NEED_KILLED] || worker[WORKER_REALOD]) return false;
    return true;
};

/**
 * 获取所有活动中的worker
 * @return {Array}
 */
exports.getAliveWorkers = () => {
    const workers = [];
    for (const id in cluster.workers) {
        const worker = cluster.workers[id];
        if (!exports.isAliveWorker(worker)) continue;
        workers.push(worker);
    }
    return workers;
};

/**
 * fork worker
 */
exports.forkWorker = function (env = {}) {
    const deferred = helper.defer();
    
    env.JH_PROCESS_ID = jhProcessId++;
    const worker = cluster.fork(env);
    
    // 接收到主进程消息
    worker.on('message', message => {
        if (worker[WORKER_REALOD]) return;
        if (message === exports.JH_GRACEFUL_DISCONNECT) {
            debug(`refork worker, receive message 'jinghuan-graceful-disconnect'`);
            worker[WORKER_REALOD] = true;
            exports.forkWorker(env).then(() => {
                //
                worker.send(exports.JH_GRACEFUL_FORK);
            });
        }
    });
    
    // 子进程连线
    worker.once('online', () => {
        debug(`worker online`);
    });
    
    // 子进程断开
    worker.once('disconnect', () => {
        if (worker[WORKER_REALOD]) return;
        debug(`worker disconnect`);
        worker[WORKER_REALOD] = true;
        exports.forkWorker(env);
    });
    
    // 子进程退出
    worker.once('exit', (code, signal) => {
        if (worker[WORKER_REALOD]) return;
        debug(`worker exit, code:${code}, signal:${signal}`);
        worker[WORKER_REALOD] = true;
        exports.forkWorker(env);
    });
    
    // 子进程开始监听
    worker.once('listening', address => {
        // add prev pid to process.env
        env.JH_PREV_PID = worker.process.pid;
        deferred.resolve({worker, address});
    });
    //
    return deferred.promise;
};
