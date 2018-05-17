'use strict';

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)('register');

function checkModule(name, option) {
    try {
        let path = require.resolve(name, { paths: option.paths });
    } catch (e) {
        console.log(`npm install ${name} --save-dev`);
        process.exit(0);
    }
}

const modules = ['source-map-support', 'babel-register', 'babel-preset-env', 'babel-preset-react', 'babel-preset-stage-0', 'babel-plugin-safe-require', 'babel-plugin-transform-decorators-legacy'];

module.exports = function (option) {
    for (let i in modules) {
        checkModule(modules[i], option);
    }

    const sourceMapSupport = _safeRequire(require.resolve('source-map-support', { paths: option.paths }));
    if ('install' in sourceMapSupport) {
        sourceMapSupport.install();
    }

    _safeRequire(require.resolve('babel-register', { paths: option.paths }))({
        ignore: function (filename) {
            filename = _path2.default.normalize(filename);

            if (option.source === 'src') {
                if (filename.startsWith(_path2.default.join(option.APP_PATH))) {
                    log(filename);
                    return false;
                }

                if (filename.startsWith(_path2.default.join(option.ROOT_PATH, 'config'))) {
                    log(filename);
                    return false;
                }
            }

            if (option.mode === 'src') {
                if (filename.startsWith(_path2.default.join(option.JH_PATH))) {
                    log(filename);
                    return false;
                }
            }
            return true;
        },
        cache: true,
        "presets": [[_safeRequire(require.resolve('babel-preset-env', { paths: option.paths })), {
            "targets": {
                "node": "9"
            }
        }], _safeRequire(require.resolve('babel-preset-react', { paths: option.paths })), _safeRequire(require.resolve('babel-preset-stage-0', { paths: option.paths }))],
        "plugins": [_safeRequire(require.resolve('babel-plugin-safe-require', { paths: option.paths })), _safeRequire(require.resolve('babel-plugin-transform-decorators-legacy', { paths: option.paths }))],
        "babelrc": false,
        "sourceMaps": true
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

    return obj && obj.__esModule ? obj.default : obj;
}