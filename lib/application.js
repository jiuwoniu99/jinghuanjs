'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('./jinghuan');

require('./props');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _helper = require('./core/helper');

var _helper2 = _interopRequireDefault(_helper);

var _pm = require('./core/pm2');

var _pm2 = _interopRequireDefault(_pm);

var _watcher = require('./core/watcher');

var _watcher2 = _interopRequireDefault(_watcher);

var _loaders = require('./loaders');

var _loaders2 = _interopRequireDefault(_loaders);

var _cluster3 = require('./core/cluster');

var _cluster4 = _interopRequireDefault(_cluster3);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _define = require('./core/helper/define');

var _define2 = _interopRequireDefault(_define);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_debug2.default.log = console.log.bind(console);

let Application = class Application {
    constructor(options = {}) {
        this._watcherCallBack = fileInfo => {
            if (this.masterInstance) {
                this.masterInstance.forceReloadWorkers();
            } else {
                if (this.init) {
                    let file = _path2.default.join(fileInfo.path, fileInfo.file);

                    var module = require.cache[file];
                    if (module) {
                        if (module.parent) {
                            module.parent.children.splice(module.parent.children.indexOf(module), 1);
                        }
                        require.cache[file] = null;
                    }
                }
            }
        };

        (0, _assert2.default)(options.ROOT_PATH, 'options.ROOT_PATH must be set');

        this.options = options;

        (0, _define2.default)('ROOT_PATH', options.ROOT_PATH);
        (0, _define2.default)('APP_PATH', options.APP_PATH);
        (0, _define2.default)('JH_PATH', options.JH_PATH);
        (0, _define2.default)('workers', options.workers);
        (0, _define2.default)('source', options.source);
        (0, _define2.default)('modules', options.modules.slice());
        (0, _define2.default)('env', options.env);
        (0, _define2.default)('PORT', options.port || 8409);
        (0, _define2.default)('HOST', options.host);
        (0, _define2.default)('mode', options.mode);
        (0, _define2.default)('paths', options.paths);
        (0, _define2.default)('process_id', options.process_id);
        (0, _define2.default)('watcher', options.watcher);
    }

    notifier(err) {
        if (!this.options.notifier) {
            return;
        }
        let notifier = this.options.notifier;
        if (!_helper2.default.isArray(notifier)) {
            notifier = [notifier];
        }
        notifier[0](Object.assign({
            title: 'JinghuanJs Transpile Error',
            message: err.message
        }, notifier[1]));
    }

    startWatcher() {
        if (!this.options.watcher) {
            return;
        }
        const srcPath = [_path2.default.join(this.options.ROOT_PATH, 'config', this.options.env), _path2.default.join(this.options.ROOT_PATH, 'src/common')];

        for (let i in this.options.modules) {
            srcPath.push(_path2.default.join(this.options.ROOT_PATH, jinghuan.source, this.options.modules[i]));
        }

        const instance = new _watcher2.default({
            srcPath: srcPath
        }, fileInfo => {
            this._watcherCallBack(fileInfo);
        });

        instance.watch();
    }

    _getMasterInstance() {
        const instance = new _cluster4.default.Master();
        this.masterInstance = instance;
        return instance;
    }

    runInMaster() {

        let instance = this._getMasterInstance();
        Promise.resolve(instance.startServer()).then(() => {
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
            this.consoleLines(lines, '-');
        });
    }

    _getWorkerInstance() {
        return new _cluster4.default.Worker();
    }

    runInWorker() {

        let instance = this._getWorkerInstance();
        Promise.resolve(instance.startServer()).then(() => {
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
        if (_pm2.default.isClusterMode) {
            throw new Error('can not use pm2 cluster mode, please change exec_mode to fork');
        }

        if (_cluster2.default.isMaster) {
            this.startWatcher();
        }

        const loaders = new _loaders2.default(this.options);

        try {
            if (_cluster2.default.isMaster) {
                if (jinghuan.workers == 0) {
                    loaders.loadAll('worker');
                    return this.runInWorker();
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