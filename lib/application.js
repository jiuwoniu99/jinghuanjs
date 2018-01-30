const path = require('path');
const cluster = require('cluster');
const helper = require('think-helper');
const Cluster = require('./core/cluster');
const pm2 = require('./core/pm2');
const http = require('http');
const assert = require('assert');
const mockHttp = require('./core/mock-http');
const jinghuanLoader = require('./loader.js');

/**
 *
 * @type {module.Application}
 */
module.exports = class Application {
    /**
     * constructor
     */
    constructor(options = {}) {
        assert(options.ROOT_PATH, 'options.ROOT_PATH must be set');
        if (!options.APP_PATH) {
            let appPath = path.join(options.ROOT_PATH, 'app');
            if (!options.transpiler && !helper.isDirectory(appPath)) {
                appPath = path.join(options.ROOT_PATH, 'src');
            }
            options.APP_PATH = appPath;
        }
        this.options = options;
        jinghuan.modules = options.modules || [];
    }

    /**
     *
     * @param err
     */
    notifier(err) {
        if (!this.options.notifier) return;
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
     *
     * @param fileInfo
     * @return {boolean}
     * @private
     */
    _watcherCallBack(fileInfo) {
        let transpiler = this.options.transpiler;
        if (transpiler) {
            if (!helper.isArray(transpiler)) {
                transpiler = [transpiler];
            }
            const ret = transpiler[0]({
                srcPath: fileInfo.path,
                outPath: this.options.APP_PATH,
                file: fileInfo.file,
                options: transpiler[1]
            });
            if (helper.isError(ret)) {
                console.error(ret.stack);
                this.notifier(ret);
                return false;
            }
            if (jinghuan.logger) {
                jinghuan.logger.info(`transpile file ${fileInfo.file} success`);
            }
        }
        // reload all workers
        if (this.masterInstance) {
            this.masterInstance.forceReloadWorkers();
        }
    }

    /**
     *
     */
    startWatcher() {
        const Watcher = this.options.watcher;
        if (!Watcher) return;
        const srcPath = [
            path.join(this.options.ROOT_PATH, 'src'),
            path.join(this.options.ROOT_PATH, 'common'),
            path.join(this.options.ROOT_PATH, 'config', this.options.env),
        ];
        const instance = new Watcher({
            srcPath: srcPath,
            //srcPath: path.join(this.options.ROOT_PATH, 'src'),
            diffPath: this.options.APP_PATH
        }, fileInfo => this._watcherCallBack(fileInfo));
        instance.watch();
    }

    /**
     *
     * @return {{}}
     */
    parseArgv() {
        const options = {};
        const argv2 = process.argv[2];
        const portRegExp = /^\d{2,5}$/;
        if (argv2) {
            if (!portRegExp.test(argv2)) {
                options.path = argv2;
            } else {
                options.port = argv2;
            }
        }
        return options;
    }

    /**
     *
     * @param argv
     * @return {Master}
     * @private
     */
    _getMasterInstance(argv) {
        const port = argv.port || jinghuan.config('port');
        const host = jinghuan.config('host');
        const instance = new Cluster.Master({
            port,
            host,
            sticky: jinghuan.config('stickyCluster'),
            getRemoteAddress: socket => {
                return socket.remoteAddress || '';
            },
            workers: jinghuan.config('workers'),
            reloadSignal: jinghuan.config('reloadSignal')
        });
        this.masterInstance = instance;
        jinghuan.logger.info(`Server running at http://${host || '127.0.0.1'}:${port}`);
        jinghuan.logger.info(`JinghuanJs version: ${jinghuan.version}`);
        jinghuan.logger.info(`Enviroment: ${jinghuan.app.env}`);
        jinghuan.logger.info(`Workers: ${instance.options.workers}`);
        return instance;
    }

    /**
     *
     * @param argv
     */
    runInMaster(argv) {
        return jinghuan.beforeStartServer().catch(err => {
            jinghuan.logger.error(err);
        }).then(() => {
            const instance = this._getMasterInstance(argv);
            return instance.startServer();
        }).then(() => {
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
        const port = argv.port || jinghuan.config('port');
        const instance = new Cluster.Worker({
            port,
            host: jinghuan.config('host'),
            sticky: jinghuan.config('stickyCluster'),
            createServer() {
                const createServerFn = jinghuan.config('createServer');
                const callback = jinghuan.app.callback();
                if (createServerFn) {
                    assert(helper.isFunction(createServerFn), 'config.createServer must be a function');
                }
                const server = createServerFn ? createServerFn(callback) : http.createServer(callback);
                jinghuan.app.server = server;
                return server;
            },
            logger: jinghuan.logger.error.bind(jinghuan.logger),
            processKillTimeout: jinghuan.config('processKillTimeout'),
            onUncaughtException: jinghuan.config('onUncaughtException'),
            onUnhandledRejection: jinghuan.config('onUnhandledRejection')
        });
        return instance;
    }

    /**
     *
     * @param argv
     */
    runInWorker(argv) {
        return jinghuan.beforeStartServer().catch(err => {
            jinghuan.logger.error(err);
        }).then(() => {
            const instance = this._getWorkerInstance(argv);
            return instance.startServer();
        }).then(() => {
            jinghuan.app.emit('appReady');
        });
    }

    /**
     *
     * @param argv
     * @return {{req, res}}
     */
    runInCli(argv) {
        jinghuan.app.emit('appReady');
        return mockHttp({
            url: argv.path,
            method: 'CLI',
            exitOnEnd: true
        }, jinghuan.app);
    }

    /**
     * 
     * @return {*}
     */
    run() {
        if (pm2.isClusterMode) {
            throw new Error('can not use pm2 cluster mode, please change exec_mode to fork');
        }
        if (cluster.isMaster) this.startWatcher();
        const instance = new jinghuanLoader(this.options);
        const argv = this.parseArgv();
        try {
            if (argv.path) {
                instance.loadAll('worker', true);
                return this.runInCli(argv);
            } else if (cluster.isMaster) {
                instance.loadAll('master');
                return this.runInMaster(argv);
            } else {
                instance.loadAll('worker');
                return this.runInWorker(argv);
            }
        } catch (e) {
            console.error(e.stack);
        }
    }
};

module.exports.jinghuan = global.jinghuan;
