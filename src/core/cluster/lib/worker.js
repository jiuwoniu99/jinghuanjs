const util = require('./util.js');
const cluster = require('cluster');
const helper = require('../../helper');
const debug = require('debug')(`JH:cluster/lib/worker[${process.pid}]`);
const KEEP_ALIVE = Symbol('keep-alive');
const WORKER_RELOAD = Symbol('worker-reload');

/**
 * default options
 */
const defaultOptions = {
    port: 0,
    host: '',
    sticky: false,
    createServer: () => {
    },
    onUncaughtException: () => true, // onUncaughtException event handle
    onUnhandledRejection: () => true, // onUnhandledRejection event handle
    processKillTimeout: 10 * 1000 // 10s
};

/**
 * 集群环境 子进程
 * Worker class
 */
class Worker {
    /**
     * constructor
     * @param {Object} options
     */
    constructor(options) {
        const port = jinghuan.PORT;
        const host = jinghuan.HOST;
        
        //logger: jinghuan.logger.error.bind(jinghuan.logger),
        // 自定义的进程启动超时
        const processKillTimeout = jinghuan.config('processKillTimeout');
        // 进程未捕获的异常
        const onUncaughtException = jinghuan.config('onUncaughtException');
        // promise 未捕获的异常
        const onUnhandledRejection = jinghuan.config('onUnhandledRejection');
        
        options = util.parseOptions({port, host, processKillTimeout, onUncaughtException, onUnhandledRejection});
        this.options = Object.assign({}, defaultOptions, options);
    }
    
    /**disable keep alive
     *
     */
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
    
    /**
     * close server
     */
    closeServer() {
        this.disableKeepAlive();
        const killTimeout = this.options.processKillTimeout;
        if (killTimeout) {
            const timer = setTimeout(() => {
                debug(`process exit by killed(timeout: ${killTimeout}ms), pid: ${process.pid}`);
                process.exit(1);
            }, killTimeout);
            timer.unref && timer.unref();
        }
        const worker = cluster.worker;
        debug(`start close server, pid: ${process.pid}`);
        
        
        this.server.close(() => {
            debug(`server closed, pid: ${process.pid}`);
            try {
                worker.disconnect();
            } catch (e) {
                debug(`already disconnect, pid:${process.pid}`);
            }
        });
    }
    
    /**
     * disconnect worker
     * @param {Boolean} sendSignal
     */
    disconnectWorker(sendSignal) {
        const worker = cluster.worker;
        // if worker has diconnect, return directly
        if (worker[WORKER_RELOAD]) {
            return;
        }
        worker[WORKER_RELOAD] = true;
        jinghuan.logger.info(`[Worker] Reload`);
        if (sendSignal) {
            
            // 通知主进程 该子进程要从集群中要开始断开
            worker.send(util.JH_GRACEFUL_DISCONNECT);
            
            worker.once('message', message => {
                // 主进程响应 新的子进程已启动
                if (message === util.JH_GRACEFUL_FORK) {
                    // 结束当前进程
                    this.closeServer();
                }
            });
        } else {
            this.closeServer();
        }
    }
    
    /**
     * 捕获重启子进程信号
     */
    captureReloadSignal() {
        process.on('message', message => {
            if (message === util.JH_RELOAD_SIGNAL) {
                this.disconnectWorker(true);
            }
        });
    }
    
    /**
     * 捕获 未处理的异常
     */
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
    
    /**
     * 捕获Promise中未处理的异常
     */
    unhandledRejection() {
        let rejectTimes = 0;
        process.on('unhandledRejection', err => {
            rejectTimes++;
            jinghuan.logger(`unhandledRejection, times: ${rejectTimes}, pid: ${process.pid}`);
            jinghuan.logger(err);
            const flag = this.options.onUnhandledRejection(err);
            if (rejectTimes === 1 && flag) {
                this.disconnectWorker(true);
            }
        });
    }
    
    /**
     * 监听端口
     */
    listen() {
        const deferred = helper.defer();
        jinghuan.app.listen(this.options.port, this.options.host, () => {
            deferred.resolve();
        });
        return deferred.promise;
    }
    
    /**
     * 捕获事件
     */
    captureEvents() {
        this.uncaughtException();
        this.unhandledRejection();
        this.captureReloadSignal();
    }
    
    /**
     * 启动服务
     */
    startServer() {
        this.captureEvents();
        return this.listen();
    }
    
    /**
     * get workers
     */
    getWorkers() {
        return process.env.JH_WORKERS;
    }
}

module.exports = Worker;
