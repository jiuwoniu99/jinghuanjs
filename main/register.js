import debug from 'debug'
import path from 'path'

const log = debug('register');

/**
 *
 * @param name
 * @param option
 */
function checkModule(name, option) {
    try {
        let path = require.resolve(name, {paths: option.paths});
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
    for (let i in modules) {
        checkModule(modules[i], option);
    }
    
    const sourceMapSupport = require(require.resolve('source-map-support', {paths: option.paths}));
    if ('install' in sourceMapSupport) {
        sourceMapSupport.install();
    }
    
    require(require.resolve('babel-register', {paths: option.paths}))({
        ignore: function (filename) {
            filename = path.normalize(filename);
            // 项目编译
            if (option.source === 'src') {
                if (filename.startsWith(path.join(option.APP_PATH))) {
                    log(filename);
                    return false;
                }
                
                if (filename.startsWith(path.join(option.ROOT_PATH, 'config'))) {
                    log(filename);
                    return false;
                }
            }
            
            // 核心编译
            if (option.mode === 'src') {
                if (filename.startsWith(path.join(option.JH_PATH))) {
                    log(filename);
                    return false;
                }
            }
            return true;
        },
        cache: false,
        "presets": [
            [
                require(require.resolve('babel-preset-env', {paths: option.paths})),
                {
                    "targets": {
                        "node": "9"
                    }
                }
            ],
            require(require.resolve('babel-preset-react', {paths: option.paths})),
            require(require.resolve('babel-preset-stage-0', {paths: option.paths})),
        ],
        "plugins": [
            require(require.resolve('babel-plugin-safe-require', {paths: option.paths})),
            require(require.resolve('babel-plugin-transform-decorators-legacy', {paths: option.paths})),
        ],
        "babelrc": false,
        "sourceMaps": true
    });
};
