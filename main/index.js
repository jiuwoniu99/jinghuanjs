import fs from 'fs-extra'
import path from 'path';
import findRoot from 'find-root';
import isString from 'lodash/isString';
//


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

/**
 *
 * @param options
 */
module.exports = function (options) {
    
    let appRootPath;
    try {
        appRootPath = findRoot(options.ROOT_PATH || process.cwd());
    } catch (e) {
        console.log(`"${appRootPath}" Not the nodejs project directory`);
        process.exit(0);
    }
    
    let rootPath = findRoot(__filename);
    let requireResolve = {paths: [appRootPath, rootPath]};
    let filename = process.mainModule.filename;
    
    // 默认是 src 测试目录
    options.source = options.source || source || 'src';
    options.host = options.host || host || '127.0.0.1';
    if (isString(options.host))
        options.host = [options.host];
    
    options.ROOT_PATH = options.ROOT_PATH || ROOT_PATH || appRootPath;
    options.env = options.env || env || path.basename(filename, '.js');
    options.port = options.port || port;
    options.watcher = options.watcher || watcher || false;
    options.modules = options.modules || modules || [options.env];
    options.requireResolve = requireResolve;
    options.workers = options.workers || workers || 0;
    options.mode = options.mode || mode || 'lib';
    options.process_id = process_id;
    
    
    let runFile = '';
    if (options.mode === 'dev' && fs.pathExistsSync(`${rootPath}/dev/application.js`)) {
        options.watcher = true;
        options.JH_PATH = path.join(rootPath, 'dev');
        runFile = `${rootPath}/dev/application`;
        require('./register.js')(options)
    } else if (options.mode === 'src' && fs.pathExistsSync(`${rootPath}/src/application.js`)) {
        
        options.JH_PATH = path.join(rootPath, 'src');
        runFile = `${rootPath}/src/application`;
        require('./register.js')(options)
    } else {
        options.mode = 'lib';
        if (options.source !== 'app') {
            options.watcher = true;
            require('./register.js')(options)
        }
        options.JH_PATH = path.join(rootPath, 'lib');
        runFile = `${rootPath}/lib/application`;
    }
    
    options.APP_PATH = path.join(options.ROOT_PATH, options.source);
    
    
    let Appliaction = require(runFile);
    let app = new Appliaction(options);
    app.run();
}