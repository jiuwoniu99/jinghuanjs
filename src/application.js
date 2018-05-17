import './jinghuan';
import './props';
import path from 'path';
import cluster from 'cluster';
import assert from 'assert';
import helper from './core/helper';
import pm2 from './core/pm2';
import Watcher from './core/watcher';
import Loaders from './loaders';
import Cluster from './core/cluster';
import debug from 'debug';
import define from './core/helper/define';

debug.log = console.log.bind(console);

/**
 * 应用程序启动入口文件
 * @type {module.Application}
 */
class Application {
    
    /**
     * constructor
     */
    constructor(options = {}) {
        assert(options.ROOT_PATH, 'options.ROOT_PATH must be set');
        
        this.options = options;
        
        define('ROOT_PATH', options.ROOT_PATH);
        define('APP_PATH', options.APP_PATH);
        define('JH_PATH', options.JH_PATH);
        define('workers', options.workers);
        define('source', options.source);
        define('modules', options.modules.slice());
        define('env', options.env);
        define('PORT', options.port || 8409);
        define('HOST', options.host);
        define('mode', options.mode);
        define('requireResolve', options.requireResolve);
        define('process_id', options.process_id);
        define('watcher', options.watcher)
        
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
    _watcherCallBack = (fileInfo) => {
        if (this.masterInstance) {
            this.masterInstance.forceReloadWorkers();
        } else {
            if (this.init) {
                let file = path.join(fileInfo.path, fileInfo.file)
                // 非集群环境
                var module = require.cache[file];
                if (module) {
                    // remove reference in module.parent
                    if (module.parent) {
                        module.parent.children.splice(module.parent.children.indexOf(module), 1);    //释放老模块的资源
                    }
                    require.cache[file] = null;    //缓存
                }
            }
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
            path.join(this.options.ROOT_PATH, 'config', this.options.env),
            path.join(this.options.ROOT_PATH, 'src/common'),
        ];
        
        for (let i in this.options.modules) {
            srcPath.push(path.join(this.options.ROOT_PATH, jinghuan.source, this.options.modules[i]),);
        }
        
        const instance = new Watcher({
            srcPath: srcPath,
        }, fileInfo => {
            this._watcherCallBack(fileInfo);
        });
        
        instance.watch();
    }
    
    /**
     *
     * @return {Master}
     * @private
     */
    _getMasterInstance() {
        // 初始化集群中的主线程类
        const instance = new Cluster.Master();
        this.masterInstance = instance;
        return instance;
    }
    
    /**
     *
     * @return {*}
     */
    runInMaster() {
        //return jinghuan.beforeStartServer()
        //    .catch(err => {
        //        jinghuan.logger.error(err);
        //    }).then(() => {
        //        let instance = this._getMasterInstance();
        //        return instance.startServer();
        //    }).then(() => {
        //        jinghuan.logger.info(`----------------------------------------------------------------------------------`);
        //        jinghuan.logger.info(`[Master] Running at http://${jinghuan.HOST || '127.0.0.1'}:${jinghuan.PORT}`);
        //        jinghuan.logger.info(`[Master] JinghuanJs version: ${jinghuan.version}`);
        //        jinghuan.logger.info(`[Master] Enviroment: ${jinghuan.env}`);
        //        jinghuan.logger.info(`[Master] Source: ${jinghuan.source}`);
        //        jinghuan.logger.info(`[Master] Mode: ${jinghuan.mode}`);
        //        jinghuan.logger.info(`[Master] Workers: ${jinghuan.config('workers')}`);
        //        jinghuan.logger.info(`----------------------------------------------------------------------------------`);
        //        jinghuan.app.emit('appReady');
        //    });
        
        let instance = this._getMasterInstance();
        Promise.resolve(instance.startServer())
            .then(() => {
                let lines = [];
                lines.push(`[Master] HOST                 [${jinghuan.HOST}]`);
                lines.push(`[Master] PORT                 ${jinghuan.PORT}`);
                lines.push(`[Master] ROOT_PATH            ${jinghuan.ROOT_PATH}`);
                lines.push(`[Master] APP_PATH             ${jinghuan.APP_PATH}`);
                lines.push(`[Master] JH_PATH              ${jinghuan.JH_PATH}`);
                lines.push(`[Master] Enviroment           ${jinghuan.env}`);
                lines.push(`[Master] Source               ${jinghuan.source}`);
                lines.push(`[Master] Mode                 ${jinghuan.mode}`);
                lines.push(`[Master] Modules              [${jinghuan.modules}]`);
                lines.push(`[Master] Workers              ${jinghuan.workers}`);
                lines.push(`[Master] Watcher              ${jinghuan.watcher ? 'true' : 'false'}`);
                this.consoleLines(lines, '-')
            })
    }
    
    /**
     *
     * @return {*}
     * @private
     */
    _getWorkerInstance() {
        return new Cluster.Worker();
    }
    
    /**
     * 子进程下运行
     */
    runInWorker() {
        //return jinghuan.beforeStartServer()
        //    .catch(err => {
        //        jinghuan.logger.error(err);
        //    }).then(() => {
        //        const instance = this._getWorkerInstance();
        //        return instance.startServer();
        //    }).then(() => {
        //        jinghuan.logger.info(`==================================================================================`);
        //        jinghuan.logger.info(`[Worker] Running at http://${jinghuan.HOST || '127.0.0.1'}:${jinghuan.PORT}`);
        //        jinghuan.logger.info(`[Worker] JinghuanJs version: ${jinghuan.version}`);
        //        jinghuan.logger.info(`[Worker] Enviroment: ${jinghuan.env}`);
        //        jinghuan.logger.info(`[Worker] Source: ${jinghuan.source}`);
        //        jinghuan.logger.info(`[Master] Mode: ${jinghuan.mode}`);
        //        jinghuan.logger.info(`[Worker] Middleware: [${jinghuan.middlewares.join(',')}]`);
        //        jinghuan.logger.info(`==================================================================================`);
        //        jinghuan.app.emit('appReady');
        //    });
        
        let instance = this._getWorkerInstance();
        Promise.resolve(instance.startServer())
            .then(() => {
                let lines = [];
                lines.push(`[Worker] JinghuanJs version   ${jinghuan.version}`);
                lines.push(`[Worker] HOST                 [${jinghuan.HOST}]`);
                lines.push(`[Worker] PORT                 ${jinghuan.PORT}`);
                lines.push(`[Worker] ROOT_PATH            ${jinghuan.ROOT_PATH}`);
                lines.push(`[Worker] APP_PATH             ${jinghuan.APP_PATH}`);
                lines.push(`[Worker] JH_PATH              ${jinghuan.JH_PATH}`);
                lines.push(`[Worker] Enviroment           ${jinghuan.env}`);
                lines.push(`[Worker] Source               ${jinghuan.source}`);
                lines.push(`[Worker] Mode                 ${jinghuan.mode}`);
                lines.push(`[Worker] Modules              [${jinghuan.modules}]`);
                lines.push(`[Worker] Workers              ${jinghuan.workers}`);
                lines.push(`[Worker] Middleware           [${jinghuan.middlewares}]`);
                lines.push(`[Worker] ID                   ${jinghuan.process_id}`);
                this.consoleLines(lines, '=')
                this.init = true
            })
    }
    
    /**
     *
     * @param lines
     * @param flag
     */
    consoleLines(lines, flag = "*") {
        let length = 0;
        let index = 0;
        let flags = [];
        lines.forEach((str) => {
            length = str.length > length ? str.length : length;
        });
        
        while (index++ < length) {
            flags.push(flag);
        }
        jinghuan.logger.info(flags.join(''));
        lines.forEach((str) => {
            jinghuan.logger.info(str);
        });
        jinghuan.logger.info(flags.join(''));
    }
    
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
        
        try {
            if (cluster.isMaster) {
                if (jinghuan.workers == 0) {
                    // 子进程
                    loaders.loadAll('worker');
                    return this.runInWorker();
                } else {
                    // 主进程
                    loaders.loadAll('master');
                    return this.runInMaster();
                }
            } else {
                // 子进程
                loaders.loadAll('worker');
                return this.runInWorker();
            }
        } catch (e) {
            console.error(e);
        }
    }
};

export default Application
