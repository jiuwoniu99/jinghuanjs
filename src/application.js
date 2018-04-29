const path = require('path');
const cluster = require('cluster');
//const process = require('process');
// const http = require('http');
//
const assert = require('assert');
//const _ = require("lodash");
//
const helper = require('./core/helper');
// const Cluster = require('./core/cluster');
const pm2 = require('./core/pm2');
// const mockHttp = require('./core/mock-http');
const Watcher = require('./core/watcher');
const Loaders = require('./loaders.js');
const Cluster = require('./core/cluster');
const debug = require('debug');

//
debug.log = console.log.bind(console);

/**
 * 应用程序启动入口文件
 * @type {module.Application}
 */
module.exports = class Application {
    
    /**
     * constructor
     */
    constructor(options = {}) {
        assert(options.ROOT_PATH, 'options.ROOT_PATH must be set');
        
        if (!options.APP_PATH) {
            options.APP_PATH = path.join(options.ROOT_PATH, this.buildPath);
        }
        
        this.options = options;
        
        Object.defineProperty(jinghuan, 'ROOT_PATH', {
            get() {
                return options.ROOT_PATH;
            }
        });
        
        Object.defineProperty(jinghuan, 'APP_PATH', {
            get() {
                return options.APP_PATH;
            }
        });
        
        Object.defineProperty(jinghuan, 'JH_PATH', {
            get() {
                return path.join(__dirname);
            }
        });
        
        Object.defineProperty(jinghuan.app, 'modules', {
            get() {
                return options.modules.slice();
            }
        });
        
        Object.defineProperty(jinghuan, 'env', {
            get() {
                return options.env;
            }
        });
        
        Object.defineProperty(jinghuan, 'PORT', {
            get() {
                return options.port || '8360';
            }
        });
        
        Object.defineProperty(jinghuan, 'HOST', {
            get() {
                return options.host;
            }
        });
    }
    
    /**
     *
     * @param err
     */
    notifier(err) {
        if (!this.options.notifier) {
            return;
        }
        let notifier = this.options.notifier;
        if (!helper.isArray(notifier)) {
            notifier = [notifier];
        }
        notifier[0](Object.assign({
            title: 'JinghuanJs Transpile Error',
            message: err.message
        }, notifier[1]));
    }
    
    /**
     * 监控文件变化的回调
     * @param fileInfo
     * @return {boolean}
     * @private
     */
    _watcherCallBack(fileInfo) {
        if (this.masterInstance) {
            this.masterInstance.forceReloadWorkers();
        }
    }
    
    /**
     * 启动文件监控
     */
    startWatcher() {
        if (!this.options.watcher) {
            return;
        }
        const srcPath = [
            path.join(this.options.ROOT_PATH, 'src'),
            path.join(this.options.ROOT_PATH, 'common'),
            path.join(this.options.ROOT_PATH, 'config', this.options.env),
        ];
        const instance = new Watcher({
            srcPath: srcPath,
        }, fileInfo => this._watcherCallBack(fileInfo));
        
        instance.watch();
    }
    
    /**
     *
     * @return {{}}
     */
    parseArgv() {
        const options = {};
        //const argv2 = process.argv[2];
        //const portRegExp = /^\d{2,5}$/;
        //if (argv2) {
        //    if (!portRegExp.test(argv2)) {
        //        options.path = argv2;
        //    } else {
        //        options.port = argv2;
        //    }
        //}
        return options;
    }
    
    /**
     *
     * @param argv
     * @return {Master}
     * @private
     */
    _getMasterInstance(argv) {
        // 初始化集群中的主线程类
        const instance = new Cluster.Master();
        
        this.masterInstance = instance;
        
        return instance;
    }
    
    /**
     *
     * @param argv
     */
    runInMaster(argv) {
        
        
        return jinghuan.beforeStartServer()
            .catch(err => {
                jinghuan.logger.error(err);
            }).then(() => {
                let instance = this._getMasterInstance(argv);
                return instance.startServer();
            }).then(() => {
                
                jinghuan.logger.info(`[Cluster] running at http://${jinghuan.HOST || '127.0.0.1'}:${jinghuan.PORT}`);
                jinghuan.logger.info(`[Cluster] JinghuanJs version: ${jinghuan.version}`);
                jinghuan.logger.info(`[Cluster] Enviroment: ${jinghuan.env}`);
                jinghuan.logger.info(`[Cluster] Workers: ${jinghuan.config('workers')}`);
                
                jinghuan.app.emit('appReady');
            });
    }
    
    /**
     *
     * @param argv
     * @return {*}
     * @private
     */
    _getWorkerInstance(argv) {
        const instance = new Cluster.Worker();
        //jinghuan.logger.info(`Worker: ${cluster.worker.process.pid}`);
        return instance;
    }
    
    /**
     * 子进程下运行
     * @param argv
     */
    runInWorker(argv) {
        return jinghuan.beforeStartServer()
            .catch(err => {
                jinghuan.logger.error(err);
            }).then(() => {
                const instance = this._getWorkerInstance(argv);
                return instance.startServer();
            }).then(() => {
                jinghuan.logger.info(`[Worker] running at http://${jinghuan.HOST || '127.0.0.1'}:${jinghuan.PORT}`);
                jinghuan.logger.info(`[Worker] JinghuanJs version: ${jinghuan.version}`);
                jinghuan.logger.info(`[Worker] Enviroment: ${jinghuan.env}`);
                
                jinghuan.app.emit('appReady');
            });
    }
    
    /**
     *
     * @param argv
     * @return {{req, res}}
     */
    // runInCli(argv) {
    //     jinghuan.app.emit('appReady');
    //     return mockHttp({
    //         url: argv.path,
    //         method: 'CLI',
    //         exitOnEnd: true
    //     }, jinghuan.app);
    // }
    
    /**
     * 运行
     * @return {*}
     */
    run() {
        if (pm2.isClusterMode) {
            throw new Error('can not use pm2 cluster mode, please change exec_mode to fork');
        }
        
        if (cluster.isMaster) {
            // 主进程下监控文件变化
            this.startWatcher();
        }
        
        const loaders = new Loaders(this.options);
        
        const argv = this.parseArgv();
        
        try {
            // 用处不大 先屏蔽了
            // if (argv.path) {
            //     // cli 运行
            //     instance.loadAll('worker', true);
            //     return this.runInCli(argv);
            // } else
            if (cluster.isMaster) {
                // 主进程
                loaders.loadAll('master');
                return this.runInMaster(argv);
            } else {
                // 子进程
                loaders.loadAll('worker');
                return this.runInWorker(argv);
            }
        } catch (e) {
            console.error(e.stack);
        }
    }
};

//module.exports.jinghuan = global.jinghuan;
