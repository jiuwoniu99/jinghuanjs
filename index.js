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
    module.exports = require(srcPaht)
}
if (isFile(libPaht)) {
    module.exports = require(libPaht)
}
