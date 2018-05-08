import path from "path"
import debug from 'debug';
import interopRequire from '../helper/interopRequire';

const log = debug(`JH:core/loader/validator[${process.pid}]`);

/**
 * load validator
 */
module.exports = function load(appPath, modules) {
    let filepath = '';
    if (modules.length) {
        filepath = path.join(appPath, 'common/config/validator.js');
    } else {
        filepath = path.join(appPath, 'config/validator.js');
    }
    log(`load file: ${filepath}`);
    const data = interopRequire(filepath, true) || {};
    return data;
};
