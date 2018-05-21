"use strict";

const path = _safeRequire("path");

const helper = _safeRequire("../helper");

const fs = _safeRequire("fs");

const debug = _safeRequire("debug");

const log = debug(`JH:core/loader/sql[${process.pid}]`);

let loadFiles = function (dir) {
    const files = helper.getdirFiles(dir).filter(file => {
        return (/\.sql/.test(file)
        );
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

module.exports = function load(appPath, modules) {
    const cache = {};
    modules.forEach(item => {
        cache[item] = {};
        const itemCache = loadFiles(path.join(appPath, item, 'sql'));
        for (const name in itemCache) {
            cache[item][name] = itemCache[name];
        }
    });
    return cache;
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

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}