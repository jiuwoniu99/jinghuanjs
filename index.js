const fs = require('fs');
const path = require('path');
const srcPaht = path.join(__dirname, '/src/application.js');
const libPaht = path.join(__dirname, '/lib/application.js');

function isFile(filePath) {
    if (!isExist(filePath)) return false;
    try {
        const stat = fs.statSync(filePath);
        return stat.isFile();
    } catch (e) {
        return false;
    }
}

function isExist(dir) {
    dir = path.normalize(dir);
    try {
        fs.accessSync(dir, fs.R_OK);
        return true;
    } catch (e) {
        return false;
    }
}

if (isFile(srcPaht)) {
    
    // 测试环境运行 需要babel编译
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
    Object.defineProperty(Appliaction.prototype, 'buildPath', {
        get() {
            return "src";
        }
    });
    module.exports = Appliaction;
}
else if (isFile(libPaht)) {
    // 生产环境运行
    let Appliaction = require('./lib/application');
    Object.defineProperty(Appliaction.prototype, 'buildPath', {
        get() {
            return "app";
        }
    });
    module.exports = Appliaction;
}
