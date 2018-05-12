const fs = _safeRequire('fs-extra');
const path = _safeRequire('path');
const findRoot = _safeRequire('find-root');
const rootPath = findRoot(__filename);
const appRootPath = findRoot(process.cwd());
const requireResolve = {paths: [appRootPath, rootPath]};
const filename = process.mainModule.filename;

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

let babel = false;
if (process.env.JH_BABEL) {
    babel = process.env.JH_BABEL;
}

let modules = false;
if (process.env.JH_MODULES) {
    modules = process.env.JH_MODULES.split(',');
}

let watcher = false;
if (process.env.JH_WATCHER) {
    watcher = process.env.JH_WATCHER === '1';
}


/**
 *
 * @param options
 */
module.exports = function (options) {
    
    // 默认是 src 测试目录
    options.source = options.source || source || 'src';
    options.host = options.host || host || '127.0.0.1';
    options.ROOT_PATH = options.ROOT_PATH || ROOT_PATH || appRootPath;
    options.env = options.env || env || path.basename(filename, '.js');
    options.port = options.port || port;
    options.watcher = options.watcher || watcher || false;
    options.modules = options.modules || modules || [options.env];
    options.babel = options.babel || babel || false;
    options.requireResolve = requireResolve;
    
    
    if (!options.APP_PATH) {
        options.APP_PATH = path.join(options.ROOT_PATH, options.source);
    }
    
    if (options.babel || options.source == "src") {
        _safeRequire('./register.js')(options)
    }
    
    let runFile = '';
    if (options.source === 'src' && fs.pathExistsSync(`${rootPath}/dev/application.js`)) {
        options.mode = 'dev';
        options.watcher = true;
        options.JH_PATH = path.join(rootPath, 'dev');
        runFile = `${rootPath}/dev/application`;
    }
    else if (options.source === 'src' && fs.pathExistsSync(`${rootPath}/src/application.js`)) {
        options.mode = 'src';
        options.watcher = true;
        options.JH_PATH = path.join(rootPath, 'src');
        runFile = `${rootPath}/src/application`;
    } else {
        options.mode = 'lib';
        options.JH_PATH = path.join(rootPath, 'lib');
        runFile = `${rootPath}/lib/application`;
    }
    
    let Appliaction = _safeRequire(runFile);
    let app = new Appliaction(options);
    app.run();
}

function _safeRequire(a, b = !0) {
    if ("string" == typeof a) if (b) try {
        a = require(a)
    } catch (b) {
        console.error(b), a = null
    } else a = require(a);
    return a && a.__esModule ? a.default : a
}
