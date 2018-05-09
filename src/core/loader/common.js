import path from "path";
import helper from "../helper";
import debug from 'debug';

const log = debug(`JH:core/loader/common[${process.pid}]`);

/**
 *
 * @type {{loadFiles(*=): {}, sort(*=): {}, load(*=, *=, *): {}}}
 */
const CommonLoader = {
    /**
     *
     * @param dir
     * @return {{}}
     */
    loadFiles(dir) {
        const files = helper.getdirFiles(dir).filter(file => {
            return /\.js$/.test(file);
        });
        const cache = {};
        files.forEach(file => {
            // replace \\ to / in windows
            const name = file.replace(/\\/g, '/').replace(/\.js$/, '');
            const filepath = path.join(dir, file);
            const fileExport = require(filepath);
            // add __filename to export when is class
            if (helper.isFunction(fileExport)) {
                fileExport.prototype.__filename = filepath;
            }
            log(`load file: ${filepath}`);
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
        //if (modules.length) {
        const cache = {};
        modules.forEach(item => {
            cache[item] = {};
            const itemCache = CommonLoader.loadFiles(path.join(appPath, item, type));
            for (const name in itemCache) {
                cache[item][name] = itemCache[name];
            }
        });
        // merge common modules to every module
        // if (cache.common) {
        //     for (const m in cache) {
        //         if (m === 'common') {
        //             continue;
        //         }
        //         cache[m] = Object.assign({}, cache.common, cache[m]);
        //         cache[m] = CommonLoader.sort(cache[m]);
        //     }
        // }
        return cache;
        //} else {
        //  const dir = path.join(appPath, type);
        //  const obj = CommonLoader.loadFiles(dir);
        //  return CommonLoader.sort(obj);
        //}
    }
};

export default CommonLoader;
