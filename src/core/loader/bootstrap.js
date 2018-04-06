const helper = require('../helper');
const path = require('path');
const debug = require('debug')(`JH:core/loader/bootstrap[${process.pid}]`);

/**
 * load bootstrap files
 */
function loadBootstrap(appPath, modules, type = 'worker') {
    let bootstrapPath = path.join(jinghuan.ROOT_PATH, 'common/bootstrap');
    const filepath = path.join(bootstrapPath, `${type}.js`);
    if (helper.isFile(filepath)) {
        debug(`load file: ${filepath}`);
        return require(filepath);
    }
}

module.exports = loadBootstrap;
