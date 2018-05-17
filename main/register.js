import debug from 'debug'
import path from 'path'

const log = debug('register');

//const log = console.log;

/**
 *
 * @param name
 * @param option.requireResolve
 */
function checkModule(name, option) {
    try {
        let path = require.resolve(name, option.requireResolve);
        //console.log(path)
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
    //console.log(option);
    for (let i in modules) {
        checkModule(modules[i], option);
    }
    
    const sourceMapSupport = require(require.resolve('source-map-support', option.requireResolve));
    if ('install' in sourceMapSupport) {
        sourceMapSupport.install();
    }
    
    require(require.resolve('babel-register', option.requireResolve))({
        ignore: function (filename) {
            filename = path.normalize(filename);
            // 项目编译
            if (option.source === 'src') {
                if (filename.startsWith(path.join(option.ROOT_PATH, 'src'))) {
                    log(filename);
                    return false;
                }
            }
            
            // 核心编译
            if (option.mode !== 'src') {
                if (filename.startsWith(path.join(option.JH_PATH, 'src'))) {
                    log(filename);
                    return false;
                }
            }
            return true;
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
