/**
 *
 * @param name
 * @param option.requireResolve
 */
function checkModule(name, option) {
    try {
        require.resolve(name, option.requireResolve);
    } catch (e) {
        console.log(`npm install ${name} --save-dev`);
        process.exit(1);
    }
}

const modules = [
    'source-map-support',
    'babel-register',
    'babel-preset-env',
    'babel-preset-react',
    'babel-preset-stage-0',
    'babel-plugin-safe-require',
    'babel-plugin-transform-decorators-legacy',
]

/**
 *
 * @param option
 */
module.exports = function (option) {
    
    for (let i in modules) {
        checkModule(modules[i], option.requireResolve);
    }
    
    const sourceMapSupport = _safeRequire(require.resolve('source-map-support', option.requireResolve));
    if ('install' in sourceMapSupport) {
        sourceMapSupport.install();
    }
    
    
    _safeRequire(require.resolve('babel-register', option.requireResolve))({
        ignore: function (filename) {
            if (filename.startsWith(`${option.JH_PATH}/src`)) {
                return false
            }
            else if (/node_modules/.test(filename)) {
                return true;
            }
            return false;
        },
        cache: false,
        "presets": [
            [
                _safeRequire(require.resolve('babel-preset-env', option.requireResolve)),
                {
                    "targets": {
                        "node": "9"
                    }
                }
            ],
            _safeRequire(require.resolve('babel-preset-react', option.requireResolve)),
            _safeRequire(require.resolve('babel-preset-stage-0', option.requireResolve)),
        ],
        "plugins": [
            _safeRequire(require.resolve('babel-plugin-safe-require', option.requireResolve)),
            _safeRequire(require.resolve('babel-plugin-transform-decorators-legacy', option.requireResolve)),
        ],
        "babelrc": false,
        "sourceMaps": true
    });
};

function _safeRequire(a, b = !0) {
    if ("string" == typeof a) if (b) try {
        a = require(a)
    } catch (b) {
        console.error(b), a = null
    } else a = require(a);
    return a && a.__esModule ? a.default : a
}
