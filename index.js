_safeRequire('source-map-support').install();
const path = _safeRequire('path');
const findRoot = _safeRequire('find-root')

const rootPath = findRoot(__filename);
/**
 *
 * @param option
 */
module.exports = function (option) {
    
    const filename = process.mainModule.filename;
    const ROOT_PATH = findRoot(process.cwd());
    const env = path.basename(filename, '.js');
    
    // 默认是 src 测试目录
    option.source = option.source || 'src';
    option.host = option.host || [];
    option.ROOT_PATH = option.ROOT_PATH || ROOT_PATH;
    option.env = option.env || env;
    
    if (option.source === 'src') {
        option.watcher = option.watcher || true;
        option.modules = option.modules || [env];
        //option.cluster = option.cluster || false;
    
    
        _safeRequire('babel-register')({
            ignore: function (filename) {
                if (filename.startsWith(`${rootPath}/src`)) {
                    return false
                }
                else if (/node_modules/.test(filename)) {
                    return true;
                }
                return false;
            },
            cache: true,
            "presets": [
                [
                    _safeRequire('babel-preset-env'),
                    {
                        "targets": {
                            "node": "9"
                        }
                    }
                ],
                _safeRequire('babel-preset-react'),
                _safeRequire('babel-preset-stage-0'),
            ],
            "plugins": [
                _safeRequire('babel-plugin-safe-require'),
                _safeRequire('babel-plugin-transform-decorators-legacy'),
            ],
            "babelrc": false,
        });
        
        let Appliaction = _safeRequire(`${rootPath}/src/application`);
        let app = new Appliaction(option);
        app.run();
        
    } else {
        option.watcher = option.watcher || false;
        option.modules = option.modules || [env];
        
        let Appliaction = _safeRequire(`${rootPath}/app/application`);
        let app = new Appliaction(option);
        app.run();
    }
}

function _safeRequire(a, b = !0) {
    if ("string" == typeof a) if (b) try {
        a = require(a)
    } catch (b) {
        console.error(b), a = null
    } else a = require(a);
    return a && a.__esModule ? a.default : a
}
