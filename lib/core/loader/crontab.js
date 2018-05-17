'use strict';

const path = _safeRequire('path');
const helper = _safeRequire('../helper');
const debug = _safeRequire('debug')(`JH:core/loader/crontab[${process.pid}]`);

module.exports = function loader(appPath, modules) {
    let crontab = [];
    modules.forEach(m => {
        const filepath = path.join(appPath, `${m}/config/crontab.js`);
        if (helper.isFile(filepath)) {
            debug(`load file: ${filepath}`);
            const data = _safeRequire(filepath, true) || [];
            crontab = crontab.concat(data);
        }
    });
    return crontab;
};

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule ? obj.default : obj;
}