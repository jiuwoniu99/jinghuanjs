'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _helper = require('../helper');

var _helper2 = _interopRequireDefault(_helper);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)(`JH:core/loader/common[${process.pid}]`);

let CommonLoader = {
    loadFiles(dir) {
        let files = _helper2.default.getdirFiles(dir).filter(file => {
            return (/\.js$/.test(file)
            );
        });
        let cache = {};
        files.forEach(file => {
            let name = file.replace(/\\/g, '/').replace(/\.js$/, '');
            let filepath = _path2.default.join(dir, file);
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
            let dir = _path2.default.join(appPath, item, type);
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

    return obj && obj.__esModule ? obj.default : obj;
}