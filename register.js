/**
 *
 * @param requireOptions
 * @param rootPath
 */
module.exports = function (requireOptions, rootPath) {
    _safeRequire(require.resolve('babel-register', requireOptions))({
        ignore: function (filename) {
            if (filename.startsWith(`${rootPath}/src`)) {
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
                _safeRequire(require.resolve('babel-preset-env', requireOptions)),
                {
                    "targets": {
                        "node": "9"
                    }
                }
            ],
            _safeRequire(require.resolve('babel-preset-react', requireOptions)),
            _safeRequire(require.resolve('babel-preset-stage-0', requireOptions)),
        ],
        "plugins": [
            _safeRequire(require.resolve('babel-plugin-safe-require', requireOptions)),
            _safeRequire(require.resolve('babel-plugin-transform-decorators-legacy', requireOptions)),
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
