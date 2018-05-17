'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _findRoot = require('find-root');

var _findRoot2 = _interopRequireDefault(_findRoot);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let host = false;
if (process.env.JH_HOST) {
    host = process.env.JH_HOST.split(',');
}

let source = false;
if (process.env.JH_SOURCE) {
    source = process.env.JH_SOURCE;
}

let ROOT_PATH = false;
if (process.env.JH_ROOT_PATH) {
    ROOT_PATH = process.env.JH_ROOT_PATH;
}

let env = false;
if (process.env.JH_ENV) {
    env = process.env.JH_ENV;
}

let port = false;
if (process.env.JH_PORT) {
    port = process.env.JH_PORT;
}

let modules = false;
if (process.env.JH_MODULES) {
    modules = process.env.JH_MODULES.split(',');
}

let watcher = false;
if (process.env.JH_WATCHER) {
    watcher = !!process.env.JH_WATCHER;
}

let workers = false;
if (process.env.JH_WORKERS) {
    workers = process.env.JH_WORKERS;
}

let mode = false;
if (process.env.JH_MODE) {
    mode = process.env.JH_MODE;
}

let process_id = false;
if (process.env.JH_PROCESS_ID) {
    process_id = process.env.JH_PROCESS_ID;
}

module.exports = function (options) {

    let appRootPath;
    try {
        appRootPath = (0, _findRoot2.default)(options.ROOT_PATH || process.cwd());
    } catch (e) {
        console.log(`"${appRootPath}" Not the nodejs project directory`);
        process.exit(0);
    }

    let rootPath = (0, _findRoot2.default)(__filename);
    let requireResolve = { paths: [appRootPath, rootPath] };
    let filename = process.mainModule.filename;

    options.source = options.source || source || 'src';
    options.host = options.host || host || '127.0.0.1';
    if ((0, _isString2.default)(options.host)) options.host = [options.host];

    options.ROOT_PATH = options.ROOT_PATH || ROOT_PATH || appRootPath;
    options.env = options.env || env || _path2.default.basename(filename, '.js');
    options.port = options.port || port;
    options.watcher = options.watcher || watcher || false;
    options.modules = options.modules || modules || [options.env];
    options.requireResolve = requireResolve;
    options.workers = options.workers || workers || 0;
    options.mode = options.mode || mode || 'lib';
    options.process_id = process_id;

    let runFile = '';
    if (options.mode === 'dev' && _fsExtra2.default.pathExistsSync(`${rootPath}/dev/application.js`)) {
        options.watcher = true;
        options.JH_PATH = _path2.default.join(rootPath, 'dev');
        runFile = `${rootPath}/dev/application`;
    } else if (options.mode === 'src' && _fsExtra2.default.pathExistsSync(`${rootPath}/src/application.js`)) {

        options.JH_PATH = _path2.default.join(rootPath, 'src');
        runFile = `${rootPath}/src/application`;
    } else {
        options.mode = 'lib';
        options.JH_PATH = _path2.default.join(rootPath, 'lib');
        runFile = `${rootPath}/lib/application`;
    }

    if (options.source !== 'app') {
        options.watcher = true;
        _safeRequire('./register.js')(options);
    }

    options.APP_PATH = _path2.default.join(options.ROOT_PATH, options.source);

    let Appliaction = _safeRequire(runFile);
    let app = new Appliaction(options);
    app.run();
};

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule ? obj.default : obj;
}