'use strict';

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)('register');

function checkModule(name, option) {
    try {
        require.resolve(name, option.requireResolve);
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
            if (option.mode == 'src' && filename.startsWith(`${option.JH_PATH}`)) {
                log(filename);
                return false;
            } else if (option.mode == 'dev' && filename.startsWith(`${option.JH_PATH}`)) {
                return true;
            } else if (/node_modules/.test(filename)) {
                return true;
            }
            log(filename);
            return false;
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