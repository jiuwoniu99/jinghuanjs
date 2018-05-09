const path = require('path');
const sms = require('source-map-support');
sms.install();

/**
 *
 * @param option
 */
module.exports = function (option) {
    
    const filename = process.mainModule.filename;
    const ROOT_PATH = path.join(filename, '../..');
    const env = path.basename(filename, '.js');
    
    // 默认是 src 测试目录
    option.source = option.source || 'src';
    //option.host = option.host || '127.0.0.1';
    option.ROOT_PATH = option.ROOT_PATH || ROOT_PATH;
    option.env = option.env || env;
    
    if (option.source === 'src') {
        option.watcher = option.watcher || true;
        option.modules = option.modules || [env];
        //option.cluster = option.cluster || false;
        
        
        require('babel-register')({
            ignore: function (filename) {
                if (filename.startsWith(__dirname + '/src/')) {
                    //console.log(filename)
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
        
        let Appliaction = require('./src/application');
        let app = new Appliaction(option);
        app.run();
        
    } else {
        option.watcher = option.watcher || false;
        option.modules = option.modules || [env];
        
        let Appliaction = require('./lib/application');
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
