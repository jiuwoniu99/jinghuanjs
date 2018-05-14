import cluster from "cluster"
import helper from "../../helper"
import debug from 'debug';

const cpus = require('os').cpus().length;
const WORKER_REALOD = Symbol('worker-reload');
const NEED_KILLED = Symbol('need-killed');
const log = debug(`JH:core/server/lib/util[${process.pid}]`);
const util = {};

let jhProcessId = 1;

// 重新启动信号
util.JH_RELOAD_SIGNAL = 'jinghuan-reload-signal';

util.JH_GRACEFUL_FORK = 'jinghuan-graceful-fork';

util.JH_GRACEFUL_DISCONNECT = 'jinghuan-graceful-disconnect';

util.JH_STICKY_CLUSTER = 'jinghuan-sticky-cluster';

util.WORKER_REALOD = WORKER_REALOD;
util.NEED_KILLED = NEED_KILLED;

/**
 * parse options
 */
util.parseOptions = function (options = {}) {
    options.workers = options.workers || cpus;
    return options;
};

/**
 * 检查worker是否处于活动状态
 * @param worker
 * @return {boolean}
 */
util.isAliveWorker = worker => {
    const state = worker.state;
    if (state === 'disconnected' || state === 'dead') return false;
    if (worker[NEED_KILLED] || worker[WORKER_REALOD]) return false;
    return true;
};

/**
 * 获取所有活动中的worker
 * @return {Array}
 */
util.getAliveWorkers = () => {
    const workers = [];
    for (const id in cluster.workers) {
        const worker = cluster.workers[id];
        if (!util.isAliveWorker(worker)) continue;
        workers.push(worker);
    }
    return workers;
};

/**
 * 启动子进程
 * @param env
 * @return {*}
 */
util.forkWorker = function (env = {}) {
    const deferred = helper.defer();
    
    env.JH_PROCESS_ID = jhProcessId++;
    
    const worker = cluster.fork(env);
    
    // 接收到主进程消息
    worker.on('message', message => {
        // 当前进程处于reload状态时不处理任何消息
        if (worker[WORKER_REALOD]) return;
        
        //
        if (message === util.JH_GRACEFUL_DISCONNECT) {
            
            log(`refork worker, receive message '${util.JH_GRACEFUL_DISCONNECT}'`);
            worker[WORKER_REALOD] = true;
            
            util.forkWorker(env).then(() => {
                worker.send(util.JH_GRACEFUL_FORK);
            });
        }
    });
    
    // 子进程连线
    worker.once('online', () => {
        log(`worker online`);
    });
    
    // 子进程断开
    worker.once('disconnect', () => {
        if (worker[WORKER_REALOD]) return;
        log(`worker disconnect`);
        worker[WORKER_REALOD] = true;
        util.forkWorker(env);
    });
    
    // 子进程退出
    worker.once('exit', (code, signal) => {
        if (worker[WORKER_REALOD]) return;
        log(`worker exit, code:${code}, signal:${signal}`);
        worker[WORKER_REALOD] = true;
        util.forkWorker(env);
    });
    
    // 子进程开始监听
    worker.once('listening', address => {
        // add prev pid to process.env
        env.JH_PREV_PID = worker.process.pid;
        deferred.resolve({worker, address});
    });
    
    return deferred.promise;
};

export default util;
