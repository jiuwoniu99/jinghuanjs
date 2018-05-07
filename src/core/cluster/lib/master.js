import util from "./util.js"

let waitReloadWorkerTimes = 0;

/**
 * 默认参数
 */
const defaultOptions = {
    port: 0, // server listen port
    host: '', // server listen host
    workers: 0, // fork worker nums
};

/**
 * 集群环境 主进程
 * Master class
 */
class Master {
    
    /**
     *
     * @param options
     */
    constructor(options) {
        
        const port = jinghuan.PORT;
        const host = jinghuan.HOST;
        const workers = jinghuan.config('workers');
        
        options = util.parseOptions({port, host, workers});
        
        this.options = Object.assign({}, defaultOptions, options);
    }
    
    /**
     * get fork env
     */
    getForkEnv() {
        return {
            JH_WORKERS: this.options.workers // workers num
        };
    }
    
    /**
     * fork workers
     */
    forkWorkers() {
        const workers = this.options.workers;
        let index = 0;
        const promises = [];
        while (index++ < workers) {
            const env = Object.assign({}, this.getForkEnv());
            const promise = util.forkWorker(env);
            promises.push(promise);
        }
        return Promise.all(promises);
    }
    
    /**
     * start server, support sticky
     */
    startServer() {
        this.forkWorkers();
    }
    
    /**
     * 强制重新加载
     * 在开发环境中强制重新加载所有的worker
     */
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
        
        const promise = util.forkWorker(this.getForkEnv())
            .then(data => {
                //this.sendInspectPort(data.worker);
                // http://man7.org/linux/man-pages/man7/signal.7.html
                this.killWorker(firstWorker, true);
                
                return aliveWorkers.map(worker => {
                    this.killWorker(worker, true);
                    return util.forkWorker(this.getForkEnv());
                });
            });
        
        return promise
            .then(() => {
                if (waitReloadWorkerTimes > 1) {
                    waitReloadWorkerTimes = 0;
                    this.forceReloadWorkers();
                } else {
                    waitReloadWorkerTimes = 0;
                }
            });
    }
    
    /**
     * send inspect port
     * @param {Worker} worker
     */
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
            process.send({act: 'inspectPort', port});
        }
    }
    
    /**
     * kill worker
     */
    killWorker(worker, reload) {
        if (reload) worker[util.WORKER_REALOD] = true;
        worker.kill('SIGINT'); // windows don't support SIGQUIT
        worker[util.NEED_KILLED] = true;
        setTimeout(function () {
            if (!worker.isConnected()) return;
            worker.process.kill('SIGINT');
        }, 100);
    }
}

export default Master;
