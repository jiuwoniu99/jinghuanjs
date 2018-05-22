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
import isArray from 'lodash/isArray'

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
        define('paths', options.paths);
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
        if (!isArray(notifier)) {
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
                    jinghuan.logger.info(`[Master] Reload ${file}`);
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
    runInMaster(tag = "Master") {
        let instance = this._getMasterInstance();
        Promise.resolve(instance.startServer())
            .then(() => {
                let lines = [];
                lines.push(`[${tag}] JinghuanJs version   ${jinghuan.version}`);
                lines.push(`[${tag}] HOST                 [${jinghuan.HOST}]`);
                lines.push(`[${tag}] PORT                 ${jinghuan.PORT}`);
                lines.push(`[${tag}] ROOT_PATH            ${jinghuan.ROOT_PATH}`);
                lines.push(`[${tag}] APP_PATH             ${jinghuan.APP_PATH}`);
                lines.push(`[${tag}] JH_PATH              ${jinghuan.JH_PATH}`);
                lines.push(`[${tag}] Enviroment           ${jinghuan.env}`);
                lines.push(`[${tag}] Source               ${jinghuan.source}`);
                lines.push(`[${tag}] Mode                 ${jinghuan.mode}`);
                lines.push(`[${tag}] Modules              [${jinghuan.modules}]`);
                lines.push(`[${tag}] Workers              ${jinghuan.workers}`);
                lines.push(`[${tag}] Watcher              ${jinghuan.watcher ? 'true' : 'false'}`);
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
    runInWorker(tag = "Worker") {
        let instance = this._getWorkerInstance();
        Promise.resolve(instance.startServer())
            .then(() => {
                let lines = [];
                lines.push(`[${tag}] JinghuanJs version   ${jinghuan.version}`);
                lines.push(`[${tag}] HOST                 [${jinghuan.HOST}]`);
                lines.push(`[${tag}] PORT                 ${jinghuan.PORT}`);
                lines.push(`[${tag}] ROOT_PATH            ${jinghuan.ROOT_PATH}`);
                lines.push(`[${tag}] APP_PATH             ${jinghuan.APP_PATH}`);
                lines.push(`[${tag}] JH_PATH              ${jinghuan.JH_PATH}`);
                lines.push(`[${tag}] Enviroment           ${jinghuan.env}`);
                lines.push(`[${tag}] Source               ${jinghuan.source}`);
                lines.push(`[${tag}] Mode                 ${jinghuan.mode}`);
                lines.push(`[${tag}] Modules              [${jinghuan.modules}]`);
                lines.push(`[${tag}] Middleware           [${jinghuan.middlewares}]`);
                lines.push(`[${tag}] ID                   ${jinghuan.process_id}`);
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
                    return this.runInWorker('Master');
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
