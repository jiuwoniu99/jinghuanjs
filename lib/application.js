'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var cluster = require('cluster');
// const http = require('http');
//
var assert = require('assert');
//const _ = require("lodash");
//
var helper = require('./core/helper');
// const Cluster = require('./core/cluster');
var pm2 = require('./core/pm2');
// const mockHttp = require('./core/mock-http');
var Watcher = require('./core/watcher');
var Loaders = require('./loaders.js');
var Server = require('./core/server');
var debug = require('debug');
// require('./decorators');

//
debug.log = console.log.bind(console);

/**
 * 应用程序启动入口文件
 * @type {module.Application}
 */
module.exports = function () {

    /**
     * constructor
     */
    function Application() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Application);

        assert(options.ROOT_PATH, 'options.ROOT_PATH must be set');
        if (!options.APP_PATH) {
            // app 目录为 babel编译后的目录
            var appPath = path.join(options.ROOT_PATH, 'app');

            // 是否使用babel编译后的文件
            if (!options.transpiler && !helper.isDirectory(appPath)) {
                appPath = path.join(options.ROOT_PATH, 'src');
            }
            options.APP_PATH = appPath;
        }
        this.options = options;

        Object.defineProperty(jinghuan, 'ROOT_PATH', {
            get: function get() {
                return options.ROOT_PATH;
            }
        });

        Object.defineProperty(jinghuan, 'APP_PATH', {
            get: function get() {
                return options.APP_PATH;
            }
        });

        Object.defineProperty(jinghuan, 'JH_PATH', {
            get: function get() {
                return path.join(__dirname, '..');
            }
        });

        Object.defineProperty(jinghuan.app, 'modules', {
            get: function get() {
                return options.modules.slice();
            }
        });

        Object.defineProperty(jinghuan, 'env', {
            get: function get() {
                return options.env;
            }
        });

        Object.defineProperty(jinghuan, 'PORT', {
            get: function get() {
                return options.port || '8360';
            }
        });

        Object.defineProperty(jinghuan, 'HOST', {
            get: function get() {
                return options.host;
            }
        });
    }

    /**
     *
     * @param err
     */


    Application.prototype.notifier = function notifier(err) {
        if (!this.options.notifier) {
            return;
        }
        var notifier = this.options.notifier;
        if (!helper.isArray(notifier)) {
            notifier = [notifier];
        }
        notifier[0](Object.assign({
            title: 'JinghuanJs Transpile Error',
            message: err.message
        }, notifier[1]));
    };

    /**
     * 监控文件变化的回调
     * @param fileInfo
     * @return {boolean}
     * @private
     */


    Application.prototype._watcherCallBack = function _watcherCallBack(fileInfo) {
        if (this.masterInstance) {
            this.masterInstance.forceReloadWorkers();
        }
    };

    /**
     * 启动文件监控
     */


    Application.prototype.startWatcher = function startWatcher() {
        var _this = this;

        if (!this.options.watcher) {
            return;
        }
        var srcPath = [path.join(this.options.ROOT_PATH, 'src'), path.join(this.options.ROOT_PATH, 'common'), path.join(this.options.ROOT_PATH, 'config', this.options.env)];
        var instance = new Watcher({
            srcPath: srcPath
        }, function (fileInfo) {
            return _this._watcherCallBack(fileInfo);
        });
        instance.watch();
    };

    /**
     *
     * @return {{}}
     */


    Application.prototype.parseArgv = function parseArgv() {
        var options = {};
        var argv2 = process.argv[2];
        var portRegExp = /^\d{2,5}$/;
        if (argv2) {
            if (!portRegExp.test(argv2)) {
                options.path = argv2;
            } else {
                options.port = argv2;
            }
        }
        return options;
    };

    /**
     *
     * @param argv
     * @return {Master}
     * @private
     */


    Application.prototype._getMasterInstance = function _getMasterInstance(argv) {
        var port = argv.port || jinghuan.PORT;
        var host = jinghuan.HOST;
        var instance = new Server.Master({
            port: port,
            host: host,
            workers: jinghuan.config('workers')
        });
        this.masterInstance = instance;
        jinghuan.logger.info('Server running at http://' + (host || '127.0.0.1') + ':' + port);
        jinghuan.logger.info('JinghuanJs version: ' + jinghuan.version);
        jinghuan.logger.info('Enviroment: ' + jinghuan.env);
        jinghuan.logger.info('Workers: ' + instance.options.workers);
        return instance;
    };

    /**
     *
     * @param argv
     */


    Application.prototype.runInMaster = function runInMaster(argv) {
        var _this2 = this;

        return jinghuan.beforeStartServer().catch(function (err) {
            jinghuan.logger.error(err);
        }).then(function () {
            var instance = _this2._getMasterInstance(argv);
            return instance.startServer();
        }).then(function () {
            jinghuan.app.emit('appReady');
        });
    };

    /**
     *
     * @param argv
     * @return {*}
     * @private
     */


    Application.prototype._getWorkerInstance = function _getWorkerInstance(argv) {
        var port = argv.port || jinghuan.PORT;
        var host = jinghuan.HOST;
        var instance = new Server.Worker({
            port: port,
            host: host,
            logger: jinghuan.logger.error.bind(jinghuan.logger),
            processKillTimeout: jinghuan.config('processKillTimeout'),
            onUncaughtException: jinghuan.config('onUncaughtException'),
            onUnhandledRejection: jinghuan.config('onUnhandledRejection')
        });
        return instance;
    };

    /**
     * 子进程下运行
     * @param argv
     */


    Application.prototype.runInWorker = function runInWorker(argv) {
        var _this3 = this;

        return jinghuan.beforeStartServer().catch(function (err) {
            jinghuan.logger.error(err);
        }).then(function () {
            var instance = _this3._getWorkerInstance(argv);
            return instance.startServer();
        }).then(function () {
            jinghuan.app.emit('appReady');
        });
    };

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


    Application.prototype.run = function run() {
        if (pm2.isClusterMode) {
            throw new Error('can not use pm2 cluster mode, please change exec_mode to fork');
        }

        if (cluster.isMaster) {
            // 主进程下监控文件变化
            this.startWatcher();
        }

        var loaders = new Loaders(this.options);
        var argv = this.parseArgv();
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
    };

    return Application;
}();

module.exports.jinghuan = global.jinghuan;