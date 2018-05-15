import util from "./util.js"

let waitReloadWorkerTimes = 0;

/**
 * 默认参数
 */
const defaultOptions = {
    port: 0,
    host: '',
    workers: 0,
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
        let port = jinghuan.PORT;
        let host = jinghuan.HOST;
        let workers = jinghuan.workers;
        
        this.options = {port, host, workers};
    }
    
    
    /**
     * fork workers
     */
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
        return {}
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
        
        const promise = util.forkWorker();
        
        promise.then(data => {
            // worker 开始监听后进入
            
            this.sendInspectPort(data.worker);
            
            // http://man7.org/linux/man-pages/man7/signal.7.html
            this.killWorker(firstWorker, true);
            
            return aliveWorkers.map(worker => {
                this.killWorker(worker, true);
                return util.forkWorker();
            });
        });
        
        
        return promise
            .then(() => {
                // 杀掉所有的子进程后
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
        //worker给发master发送消息要用process.send(message)
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
