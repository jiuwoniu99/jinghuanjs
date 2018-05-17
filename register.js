'use strict';

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = console.log;

function checkModule(name, option) {
    try {
        let path = require.resolve(name, option.requireResolve);
        console.log(path);
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

    const sourceMapSupport = _safeRequire(require.resolve('source-map-support', option.requireResolve));
    if ('install' in sourceMapSupport) {
        sourceMapSupport.install();
    }

    _safeRequire(require.resolve('babel-register', option.requireResolve))({
        ignore: function (filename) {
            if (option.source === 'src') {
                if (filename.startsWith(_path2.default.join(option.ROOT_PATH, 'src'))) {
                    log(filename);
                    return false;
                }
            }

            if (option.mode !== 'src') {
                if (filename.startsWith(_path2.default.join(option.JH_PATH, 'src'))) {
                    log(filename);
                    return false;
                }
            }
            return true;
        },
        cache: true,
        "presets": [[_safeRequire(require.resolve('babel-preset-env', option.requireResolve)), {
            "targets": {
                "node": "9"
            }
        }], _safeRequire(require.resolve('babel-preset-react', option.requireResolve)), _safeRequire(require.resolve('babel-preset-stage-0', option.requireResolve))],
        "plugins": [_safeRequire(require.resolve('babel-plugin-safe-require', option.requireResolve)), _safeRequire(require.resolve('babel-plugin-transform-decorators-legacy', option.requireResolve))],
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