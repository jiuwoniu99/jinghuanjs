'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

_safeRequire('./jinghuan');

_safeRequire('./props');

const path = _safeRequire('path');

const cluster = _safeRequire('cluster');

const assert = _safeRequire('assert');

const helper = _safeRequire('./core/helper');

const pm2 = _safeRequire('./core/pm2');

const Watcher = _safeRequire('./core/watcher');

const Loaders = _safeRequire('./loaders');

const Cluster = _safeRequire('./core/cluster');

const debug = _safeRequire('debug');

const define = _safeRequire('./core/helper/define');

const isArray = _safeRequire('lodash/isArray');

debug.log = console.log.bind(console);

let Application = class Application {
    constructor(options = {}) {
        this.watcherCallBack = fileInfo => {
            if (this.masterInstance) {
                this.masterInstance.forceReloadWorkers();
            } else {
                if (this.init) {
                    let file = path.join(fileInfo.path, fileInfo.file);

                    var module = require.cache[file];
                    if (module) {
                        if (module.parent) {
                            module.parent.children.splice(module.parent.children.indexOf(module), 1);
                        }
                        require.cache[file] = null;
                        jinghuan.logger.info(`[Master] Reload ${file}`);
                    }
                }
            }
        };

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
        define('watcher', options.watcher);
        define('socket', options.socket);
    }

    notifier(err) {
        if (!jinghuan.notifier) {
            return;
        }
        let notifier = jinghuan.notifier;
        if (!isArray(notifier)) {
            notifier = [notifier];
        }
        notifier[0](Object.assign({
            title: 'JinghuanJs Transpile Error',
            message: err.message
        }, notifier[1]));
    }

    startWatcher() {
        if (!jinghuan.watcher) {
            return;
        }
        const srcPath = [path.join(jinghuan.ROOT_PATH, 'config', jinghuan.env), path.join(jinghuan.ROOT_PATH, 'src/common')];

        for (let i in jinghuan.modules) {
            srcPath.push(path.join(jinghuan.ROOT_PATH, jinghuan.source, jinghuan.modules[i]));
        }

        const instance = new Watcher({
            srcPath: srcPath
        }, fileInfo => {
            this.watcherCallBack(fileInfo);
        });

        instance.watch();
    }

    getMasterInstance() {
        const instance = new Cluster.Master();
        this.masterInstance = instance;
        return instance;
    }

    runInMaster(tag = "Master") {
        let instance = this.getMasterInstance();
        Promise.resolve(instance.startServer()).then(() => {
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
            this.consoleLines(lines, '-');
        });
    }

    getWorkerInstance() {
        return new Cluster.Worker();
    }

    runInWorker(tag = "Worker") {
        let instance = this.getWorkerInstance();
        Promise.resolve(instance.startServer()).then(() => {
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
            lines.push(`[${tag}] Socket               ${jinghuan.socket}`);
            lines.push(`[${tag}] ID                   ${jinghuan.process_id}`);
            this.consoleLines(lines, '=');
            this.init = true;
        });
    }

    consoleLines(lines, flag = "*") {
        let length = 0;
        let index = 0;
        let flags = [];
        lines.forEach(str => {
            length = str.length > length ? str.length : length;
        });

        while (index++ < length) {
            flags.push(flag);
        }
        jinghuan.logger.info(flags.join(''));
        lines.forEach(str => {
            jinghuan.logger.info(str);
        });
        jinghuan.logger.info(flags.join(''));
    }

    run() {
        if (pm2.isClusterMode) {
            throw new Error('can not use pm2 cluster mode, please change exec_mode to fork');
        }

        if (cluster.isMaster) {
            this.startWatcher();
        }

        const loaders = new Loaders(jinghuan);

        try {
            if (cluster.isMaster) {
                if (jinghuan.workers == 0) {
                    loaders.loadAll('worker');
                    return this.runInWorker('Master');
                } else {
                    loaders.loadAll('master');
                    return this.runInMaster();
                }
            } else {
                loaders.loadAll('worker');
                return this.runInWorker();
            }
        } catch (e) {
            console.error(e);
        }
    }
};
;

exports.default = Application;

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}