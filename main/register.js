import debug from 'debug'

const log = debug('register');

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
        process.exit(0);
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
    
    const sourceMapSupport = require(require.resolve('source-map-support', option.requireResolve));
    if ('install' in sourceMapSupport) {
        sourceMapSupport.install();
    }
    
    require(require.resolve('babel-register', option.requireResolve))({
        ignore: function (filename) {
            if (option.mode == 'src' && filename.startsWith(`${option.JH_PATH}`)) {
                log(filename);
                return false
            } else if (option.mode == 'dev' && filename.startsWith(`${option.JH_PATH}`)) {
                return true
            }
            else if (/node_modules/.test(filename)) {
                return true;
            }
            log(filename);
            return false;
        },
        cache: true,
        "presets": [
            [
                require(require.resolve('babel-preset-env', option.requireResolve)),
                {
                    "targets": {
                        "node": "9"
                    }
                }
            ],
            require(require.resolve('babel-preset-react', option.requireResolve)),
            require(require.resolve('babel-preset-stage-0', option.requireResolve)),
        ],
        "plugins": [
            require(require.resolve('babel-plugin-safe-require', option.requireResolve)),
            require(require.resolve('babel-plugin-transform-decorators-legacy', option.requireResolve)),
        ],
        "babelrc": false,
        "sourceMaps": true
    });
};
