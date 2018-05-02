const path = require('path');

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
            ignore: (filename) => {
                if (filename.startsWith(__dirname + '/src/')) {
                    return false
                }
                else if (/node_modules/.test(filename)) {
                    return true;
                }
                return false;
            },
            cache: true
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
