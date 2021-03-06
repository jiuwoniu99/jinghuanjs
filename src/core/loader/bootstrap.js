import helper from "../helper"
import path from "path"
import debug from 'debug';

const log = debug(`JH:core/loader/bootstrap[${process.pid}]`);

/**
 * load bootstrap files
 */
function loadBootstrap(appPath, modules, type = 'worker') {
    let bootstrapPath = path.join(jinghuan.ROOT_PATH, jinghuan.source, '/common/bootstrap');
    const filepath = path.join(bootstrapPath, `${type}.js`);
    if (helper.isFile(filepath)) {
        log(`load file: ${filepath}`);
        return require(filepath);
    }
}

export default loadBootstrap;
