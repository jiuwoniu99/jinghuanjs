'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const path = _safeRequire('path');

const helper = _safeRequire('../helper');

const debug = _safeRequire('debug');

const log = debug(`JH:core/loader/common[${process.pid}]`);

let CommonLoader = {
    loadFiles(dir) {
        let files = helper.getdirFiles(dir).filter(file => {
            return (/\.js$/.test(file)
            );
        });
        let cache = {};
        files.forEach(file => {
            let name = file.replace(/\\/g, '/').replace(/\.js$/, '');
            let filepath = path.join(dir, file);
            log(`load file: ${filepath}`);

            let fileExport = filepath;
            if (jinghuan.mode === 'lib') {
                fileExport = _safeRequire(fileExport);
            }

            cache[name] = fileExport;
        });
        return cache;
    },

    sort(obj) {
        const cache = Object.keys(obj).map(item => {
            return { name: item, export: obj[item] };
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

exports.default = CommonLoader;

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