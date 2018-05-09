const path = require('path');
const helper = require('../helper');
const debug = require('debug')(`JH:core/loader/crontab[${process.pid}]`);

/**
 * load crontab
 */
module.exports = function loader(appPath, modules) {
    let crontab = [];
    modules.forEach(m => {
        const filepath = path.join(appPath, `${m}/config/crontab.js`);
        if (helper.isFile(filepath)) {
            debug(`load file: ${filepath}`);
            const data = require(filepath, true) || [];
            crontab = crontab.concat(data);
        }
    });
    return crontab;
};
