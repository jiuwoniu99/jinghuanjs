#!/usr/bin/env node
'use strict';

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _findRoot = require('find-root');

var _findRoot2 = _interopRequireDefault(_findRoot);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package2.default.version).option('-P, --port [n]', 'set port                       -P 8409             ', '8409').option('-H, --host [value]', 'set host                       -H 127.0.0.1,...    ', '127.0.0.1').option('-S, --source [value]', 'set source                     -S app|src          ', 'app').option('-R, --root-path [value]', 'set root path                  -R /[you work path] ', './').option('-E, --env [value]', 'set env                        -E index            ', 'index').option('-M, --modules [value]', 'set modules                    -M index,...        ', 'index').option('-C, --config [value]', 'set config file path           -C config.js        ', null).option('-W, --workers [n]', 'set workers number             -W 1                ', 1).option('demo', 'run demo                                           ').option('babel [value]', '                                                   ').parse(process.argv);

function demo(tplPath) {
    _safeRequire('../index.js')({
        ROOT_PATH: tplPath,
        source: 'src',
        port: 8409,
        env: 'index',
        modules: ['index'],
        workers: 1,
        mode: 'lib'
    });
}

if ((0, _isString2.default)(_commander2.default.babel)) {
    _safeRequire('../babel')(_commander2.default.babel, function (option) {});
} else if (_commander2.default.demo) {
    let tplPath = _path2.default.join(__dirname, '../tpl');

    if (_cluster2.default.isMaster && !_fsExtra2.default.pathExistsSync(_path2.default.join(tplPath, 'node_modules'))) {
        console.log(`Running $ cd "${tplPath}" &&  npm install`);
        let error = false;
        let exec = _child_process2.default.exec;
        exec(`cd "${tplPath}" &&  npm install`, function (err, stdout, stderr) {
            if (err) {
                error = true;
                console.log(stderr);
            } else {
                console.log(stdout);
            }
        }).on('exit', function (code) {
            if (error) {
                process.exit(0);
            } else {
                demo(tplPath);
            }
        });
    } else {
        demo(tplPath);
    }
} else {
    const rootPath = (0, _findRoot2.default)(__filename);

    try {
        (0, _findRoot2.default)(process.cwd());
    } catch (e) {
        console.log(`"${process.cwd()}" Not the nodejs project directory`);
        process.exit(0);
    }
    const appRootPath = (0, _findRoot2.default)(process.cwd());
    const requireResolve = { paths: [appRootPath, rootPath] };

    let options = {};

    if (_commander2.default.config) {
        try {
            let file = require.resolve(_commander2.default.config, requireResolve);
            options = _safeRequire(file);
            options.port = options.port || _commander2.default.port;
            options.host = options.host || _commander2.default.host.split(',');
            options.source = options.source || _commander2.default.source;
            options.ROOT_PATH = options.ROOT_PATH || _commander2.default['root-path'] || appRootPath;
            options.env = options.env || _commander2.default.env;
            options.modules = options.modules || _commander2.default.modules.split(',');
            options.workers = options.workers || _commander2.default.workers;

            let sourcePath = `${options.ROOT_PATH}/${options.source}`;
            if (!_fsExtra2.default.pathExistsSync(sourcePath)) {
                console.log(`The "${sourcePath}" has not been found`);
                process.exit(0);
            }
        } catch (e) {
            console.log(`file "${_commander2.default.config}" has not been found`);
            process.exit(0);
        }
        _safeRequire('../index.js')(options);
    } else {

        options.port = _commander2.default.port;

        options.host = _commander2.default.host.split(',');

        options.source = _commander2.default.source;

        options.ROOT_PATH = _commander2.default['root-path'] || appRootPath;

        let sourcePath = `${options.ROOT_PATH}/${options.source}`;
        if (!_fsExtra2.default.pathExistsSync(sourcePath)) {
            console.log(`The "${sourcePath}" has not been found`);
            process.exit(0);
        }

        options.env = _commander2.default.env;

        options.modules = _commander2.default.modules.split(',');

        options.workers = _commander2.default.workers;

        _safeRequire('../index.js')(options);
    }
}

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