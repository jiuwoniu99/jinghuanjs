const path = require('path');
const helper = require('../helper');
const assert = require('assert');
const util = require('./util.js');
const interopRequire = util.interopRequire;
const extendObj = util.extend;
const debug = require('debug')(`JH:core/loader/extend[${process.pid}]`);

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
     * @param appPath
     * @param jinghuanPath
     * @param modules
     * @return {{}}
     */
    load(appPath, jinghuanPath, modules) {
        const allowExtends = ExtendLoader.allowExtends;
        const ret = {};

        function assign(type, ext) {
            if (!ret[type]) {
                ret[type] = {};
            }
            ret[type] = extendObj(ret[type], ext);
        }

        // system extend
        allowExtends.forEach(type => {
            const filepath = path.join(jinghuanPath, `lib/extend/${type}.js`);
            if (!helper.isFile(filepath)) {
                return;
            }
            debug(`load file: ${filepath}`);
            assign(type, interopRequire(filepath));
        });

        // application extend
        allowExtends.forEach(type => {
            const filepath = path.join(jinghuan.ROOT_PATH, `common/extend/${type}.js`);
            if (!helper.isFile(filepath)) {
                return;
            }
            debug(`load file: ${filepath}`);
            assign(type, interopRequire(filepath));
        });
        return ret;
    }
};

module.exports = ExtendLoader;
