import path from "path"
import helper from "../helper"
import fs from "fs"
import debug from 'debug';

const log = debug(`JH:core/loader/sql[${process.pid}]`);
/**
 *
 * @param dir
 * @return {{}}
 */
let loadFiles = function (dir) {
    const files = helper.getdirFiles(dir).filter(file => {
        return /\.sql/.test(file);
    });
    const cache = {};
    files.forEach(file => {
        const name = file.replace(/\\/g, '/').replace(/\.sql$/, '');
        const filepath = path.join(dir, file);
        log(`load file: ${filepath}`);
        cache[name] = fs.readFileSync(filepath, "utf-8");
    });
    return cache;
};

/**
 * load sql
 */
module.exports = function load(appPath, modules) {
    const cache = {};
    modules.forEach(item => {
        cache[item] = {};
        const itemCache = loadFiles(path.join(appPath, item, 'sql'));
        for (const name in itemCache) {
            cache[item][name] = itemCache[name];
        }
    })
    return cache;
};
