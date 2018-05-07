import path from "path"
import helper from "../helper"
//import assert from "assert"
import util from "./util.js"
import interopRequire from '../helper/interopRequire';
import debug from 'debug';

const log = debug(`JH:core/loader/extend[${process.pid}]`);

const ExtendLoader = {
    
    allowExtends: [
        'jinghuan',
        'application',
        'context',
        // 'request',
        // 'response',
        'controller',
        // 'logic',
        // 'service'
    ],
    
    /**
     *
     * @param extendPath
     * @param modules
     */
    load(extendPath, modules) {
        const allowExtends = ExtendLoader.allowExtends;
        const ret = {};
        
        function assign(type, ext) {
            if (!ret[type]) {
                ret[type] = {};
            }
            ret[type] = util.extend(ret[type], ext);
        }
        
        // system extend
        allowExtends.forEach(type => {
            const filepath = path.join(extendPath, `extend/${type}.js`);
            if (!helper.isFile(filepath)) {
                return;
            }
            log(`load file: ${filepath}`);
            assign(type, interopRequire(filepath));
        });
        
        // application extend
        // allowExtends.forEach(type => {
        //     const filepath = path.join(jinghuan.ROOT_PATH, `common/extend/${type}.js`);
        //     if (!helper.isFile(filepath)) {
        //         return;
        //     }
        //     debug(`load file: ${filepath}`);
        //     assign(type, interopRequire(filepath));
        // });
        return ret;
    }
};

export default ExtendLoader;
