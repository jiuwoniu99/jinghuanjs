import path from 'path';
import helper from '../helper';
import debug from 'debug';

const log = debug(`JH:core/loader/common[${process.pid}]`);

/**
 *
 * @type {{loadFiles(*=): {}, sort(*=): {}, load(*=, *=, *): {}}}
 */
let CommonLoader = {
    /**
     *
     * @param dir
     * @return {{}}
     */
    loadFiles(dir) {
        let files = helper.getdirFiles(dir).filter(file => {
            return /\.js$/.test(file);
        });
        let cache = {};
        files.forEach(file => {
            // replace \\ to / in windows
            let name = file.replace(/\\/g, '/').replace(/\.js$/, '');
            let filepath = path.join(dir, file);
            log(`load file: ${filepath}`);
            
            
            let fileExport = filepath;
            if (jinghuan.mode === 'lib') {
                fileExport = require(fileExport);
            }
            
            
            //require(filepath);
            // const fileExport = require(filepath);
            // add __filename to export when is class
            //if (helper.isFunction(fileExport)) {
            //    fileExport.prototype.__filename = filepath;
            //}
            
            cache[name] = fileExport;
        });
        return cache;
    },
    /**
     *
     * @param obj
     * @return {{}}
     */
    sort(obj) {
        const cache = Object.keys(obj).map(item => {
            return {name: item, export: obj[item]};
        }).sort((a, b) => {
            const al = a.name.split('/').length;
            const bl = b.name.split('/').length;
            if (al === bl) {
                return a.name < b.name ? 1 : -1;
            }
            return al < bl ? 1 : -1;
        });
        const ret = {};
        for (const name in cache) {
            ret[cache[name].name] = cache[name].export;
        }
        return ret;
    },
    /**
     *
     * @param appPath
     * @param type
     * @param modules
     * @return {{}}
     */
    load(appPath, type, modules) {
        let cache = {};
        modules.forEach(item => {
            cache[item] = {};
            let dir = path.join(appPath, item, type);
            let itemCache = CommonLoader.loadFiles(dir);
            for (const name in itemCache) {
                cache[item][name] = itemCache[name];
            }
        });
        return cache;
    }
};

export default CommonLoader;
