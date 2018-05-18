'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _findRoot = require('find-root');

var _findRoot2 = _interopRequireDefault(_findRoot);

var _set = require('lodash/set');

var _set2 = _interopRequireDefault(_set);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _json = require('json5');

var _json2 = _interopRequireDefault(_json);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isFile(str) {
    return _fsExtra2.default.existsSync(str) && _fsExtra2.default.statSync(str).isFile();
}

function isDir(str) {
    return _fsExtra2.default.existsSync(str) && _fsExtra2.default.statSync(str).isDirectory();
}

function checkModule(name, option) {
    try {
        require.resolve(name, option);
    } catch (e) {
        console.log(`npm install ${name} --save-dev`);
        process.exit(0);
    }
}

function checkFile(name, option) {
    try {
        return require.resolve(name, option);
    } catch (e) {
        console.log(`Error : file (${name}) not found`);
        process.exit(0);
    }
}

const modules = ['babel-core', 'babel-preset-env', 'babel-preset-react', 'babel-preset-stage-0', 'babel-plugin-safe-require', 'babel-plugin-transform-decorators-legacy'];

module.exports = function (str, callback) {
    let watchs = [];

    let appRootPath;
    try {
        appRootPath = (0, _findRoot2.default)(process.cwd());
    } catch (e) {
        console.log(`"${appRootPath}" Not the nodejs project directory`);
        process.exit(0);
    }
    let srcPath = _path2.default.join(appRootPath, 'src');
    let appPath = _path2.default.join(appRootPath, 'app');

    let rootPath = (0, _findRoot2.default)(__filename);

    let paths = [appRootPath, rootPath, _path2.default.join(appRootPath, 'node_modules'), _path2.default.join(rootPath, 'node_modules')];

    for (let i in modules) {
        checkModule(modules[i], { paths });
    }

    const sourceMapSupport = _safeRequire(require.resolve('source-map-support', { paths }));
    if ('install' in sourceMapSupport) {
        sourceMapSupport.install();
    }

    let keys = str.split(',');

    for (let i in keys) {
        let file = checkFile(_path2.default.join('src', keys[i], '.jinghuanjs'), { paths });
        let json = _fsExtra2.default.readFileSync(file);
        try {
            let opt = _json2.default.parse(json);
            if ((0, _isArray2.default)(opt.paths)) {
                opt.paths.map(function (name) {
                    watchs.push(_path2.default.join(appRootPath, 'src', keys[i], name));
                });
            }
        } catch (e) {
            consle.log(`Error : parse file (${file}) error`);
            process.exit(0);
        }
    }

    let config = {
        exts: ['.js', '.jsx'],
        babel: {
            "presets": [[_safeRequire(require.resolve('babel-preset-env', { paths })), {
                "targets": {
                    "node": "9"
                }
            }], _safeRequire(require.resolve('babel-preset-react', { paths })), _safeRequire(require.resolve('babel-preset-stage-0', { paths }))],
            "plugins": [_safeRequire(require.resolve('babel-plugin-safe-require', { paths })), _safeRequire(require.resolve('babel-plugin-transform-decorators-legacy', { paths }))],
            "comments": false,
            "babelrc": false,
            "sourceMaps": true
        }
    };

    let babel = _safeRequire(require.resolve('babel-core', { paths }));

    _chokidar2.default.watch(watchs, {}).on('all', (event, file, stats) => {
        file = _path2.default.normalize(file);
        let resolve = file.replace(srcPath, '');
        let ext_name = _path2.default.extname(file);

        switch (event) {
            case 'change':
            case 'add':
                try {
                    if (config.exts.indexOf(ext_name) != -1) {
                        babel.transformFile(file, config.babel, function (err, result) {
                            if (err) console.error(err);else {
                                let toFile = _path2.default.join(appPath, resolve);
                                _fsExtra2.default.writeFileSync(toFile, result.code);
                                result.map.file = toFile;
                                _fsExtra2.default.writeFileSync(toFile + '.map', _json2.default.stringify(result.map));
                                console.log('out', _path2.default.join('src', resolve), ' -> ', _path2.default.join('app', resolve));
                            }
                        });
                    } else {
                        _fsExtra2.default.copySync(file, _path2.default.join(appPath, resolve));
                        console.log('copy', _path2.default.join('src', resolve), ' -> ', _path2.default.join('app', resolve));
                    }
                } catch (e) {
                    console.error(e);
                }
                break;
            case 'addDir':
                console.log('create', _path2.default.join(appPath, resolve));
                _fsExtra2.default.ensureDirSync(_path2.default.join('app', resolve));
                break;
            case 'unlinkDir':
            case 'unlink':
                console.log('remove', _path2.default.join('app', resolve));
                _fsExtra2.default.removeSync(_path2.default.join(appPath, resolve));
                break;
        }
    });
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

    return obj && obj.__esModule ? obj.default || obj : obj;
}
//# sourceMappingURL=babel.js.map