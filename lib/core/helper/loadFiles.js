const helper = require('./index');
const path = require('path');

module.exports = function(dir, ext) {
    const ragexp = new RegExp('\\.' + ext + '$');
    const files = helper.getdirFiles(dir).filter(file => {
        return ragexp.test(file);
    });
    const cache = {};
    files.forEach(file => {
        const name = file.replace(/\\/g, '/').replace(ragexp, '');
        const filepath = path.join(dir, file);
        cache[name] = filepath;
    });
    return cache;
};
