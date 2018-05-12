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
 * @param option
 */
module.exports = function (option) {
    
    // 默认是 src 测试目录
    option.source = option.source || source || 'src';
    option.host = option.host || host || [];
    option.ROOT_PATH = option.ROOT_PATH || ROOT_PATH || appRootPath;
    option.env = option.env || env || path.basename(filename, '.js');
    option.port = option.port || port;
    option.watcher = option.watcher || watcher || false;
    option.modules = option.modules || modules || [option.env];
    option.babel = option.babel || babel || false;
    option.requireResolve = requireResolve;
    
    
    if (option.babel || option.source == "src") {
        _safeRequire('./register.js')(option)
    }
    
    if (option.source === 'src' && fs.pathExistsSync(`${rootPath}/src/application.js`)) {
        let Appliaction = _safeRequire(`${rootPath}/src/application`);
        let app = new Appliaction(option);
        app.run();
    } else {
        let Appliaction = _safeRequire(`${rootPath}/lib/application`);
        let app = new Appliaction(option);
        app.run();
    }
}

function _safeRequire(a, b = !0) {
    if ("string" == typeof a) if (b) try {
        a = require(a)
    } catch (b) {
        console.error(b), a = null
    } else a = require(a);
    return a && a.__esModule ? a.default : a
}
