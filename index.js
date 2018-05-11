_safeRequire('source-map-support').install();
const path = _safeRequire('path');
const findRoot = _safeRequire('find-root');
const rootPath = findRoot(__filename);
const appRootPath = findRoot(process.cwd());
const requireOptions = {paths: [appRootPath, rootPath]};

let host = false;
if (process.env.jh_host) {
    host = process.env.jh_host.split(',');
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

/**
 *
 * @param option
 */
module.exports = function (option) {
    
    const filename = process.mainModule.filename;
    
    
    // 默认是 src 测试目录
    option.source = option.source || source || 'src';
    option.host = option.host || host || [];
    option.ROOT_PATH = option.ROOT_PATH || ROOT_PATH || appRootPath;
    option.env = option.env || env || path.basename(filename, '.js');
    option.port = option.port || port;
    
    if (option.source === 'src') {
        option.watcher = option.watcher || true;
        option.modules = option.modules || [env];
        //option.cluster = option.cluster || false;
        
        _safeRequire('./register.js')(requireOptions, rootPath)
        
        let Appliaction = _safeRequire(`${rootPath}/src/application`);
        let app = new Appliaction(option);
        app.run();
        
    } else {
        option.watcher = option.watcher || false;
        option.modules = option.modules || [env];
        
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
