'use strict';

const fs = _safeRequire('fs-extra');

const path = _safeRequire('path');

const findRoot = _safeRequire('find-root');

const isString = _safeRequire('lodash/isString');

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

let socket = false;
if (process.env.JH_SOCKET) {
    socket = process.env.JH_SOCKET;
}

function checkModule(name, option) {
    try {
        return require.resolve(name, option);
    } catch (e) {
        return false;
    }
}

module.exports = function (options) {

    let appRootPath;
    try {
        appRootPath = findRoot(options.ROOT_PATH || process.cwd());
    } catch (e) {
        console.log(`"${appRootPath}" Not the nodejs project directory`);
        process.exit(0);
    }

    let rootPath = findRoot(__filename);

    let paths = [rootPath, appRootPath, path.join(rootPath, 'node_modules'), path.join(appRootPath, 'node_modules')];

    let filename = process.mainModule.filename;

    options.source = options.source || source || 'src';
    options.host = options.host || host || '127.0.0.1';
    if (isString(options.host)) options.host = [options.host];

    options.ROOT_PATH = options.ROOT_PATH || ROOT_PATH || appRootPath;
    options.env = options.env || env || path.basename(filename, '.js');
    options.port = options.port || port;
    options.watcher = options.watcher || watcher || false;
    options.modules = options.modules || modules || [options.env];
    options.paths = paths;
    options.workers = options.workers || workers || 0;
    options.mode = options.mode || mode || 'lib';
    options.process_id = process_id;
    options.socket = options.socket || socket || false;

    let runFile = '';
    let devFile = path.join(rootPath, 'dev', 'application.js');
    let devPath = path.join(rootPath, 'dev');

    let srcFile = path.join(rootPath, 'src', 'application.js');
    let srcPath = path.join(rootPath, 'src');

    let libFile = path.join(rootPath, 'lib', 'application.js');
    let libPath = path.join(rootPath, 'lib');

    if (options.mode === 'dev' && fs.pathExistsSync(devFile)) {
        options.watcher = true;
        options.JH_PATH = devPath;
        runFile = devFile;
    } else if (options.mode === 'src' && fs.pathExistsSync(srcFile)) {
        options.watcher = true;
        options.JH_PATH = srcPath;
        runFile = srcFile;
    } else {
        options.mode = 'lib';
        options.JH_PATH = libPath;
        runFile = libFile;
    }

    if (options.source !== 'app') {
        options.watcher = true;
        _safeRequire('./register.js')(options);
    } else {
        if (checkModule('source-map-support')) {
            const sourceMapSupport = _safeRequire(require.resolve('source-map-support', { paths }));
            if ('install' in sourceMapSupport) {
                sourceMapSupport.install();
            }
        }
    }

    options.APP_PATH = path.join(options.ROOT_PATH, options.source);

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

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}
//# sourceMappingURL=index.js.map