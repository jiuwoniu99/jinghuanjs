'use strict';

var path = require('path');
//const _ = require('lodash');
var debug = require('debug')('JH:core/loader/common[' + process.pid + ']');
//
var helper = require('../helper');
var interopRequire = require('./util.js').interopRequire;

var CommonLoader = {
    /**
     *
     * @param dir
     * @return {{}}
     */
    loadFiles: function loadFiles(dir) {
        var files = helper.getdirFiles(dir).filter(function (file) {
            return (/\.js$/.test(file)
            );
        });
        var cache = {};
        files.forEach(function (file) {
            // replace \\ to / in windows
            var name = file.replace(/\\/g, '/').replace(/\.js$/, '');
            var filepath = path.join(dir, file);
            var fileExport = interopRequire(filepath);
            // add __filename to export when is class
            if (helper.isFunction(fileExport)) {
                fileExport.prototype.__filename = filepath;
            }
            debug('load file: ' + filepath);
            cache[name] = fileExport;
        });
        return cache;
    },

    /**
     *
     * @param obj
     * @return {{}}
     */
    sort: function sort(obj) {
        var cache = Object.keys(obj).map(function (item) {
            return { name: item, export: obj[item] };
        }).sort(function (a, b) {
            var al = a.name.split('/').length;
            var bl = b.name.split('/').length;
            if (al === bl) {
                return a.name < b.name ? 1 : -1;
            }
            return al < bl ? 1 : -1;
        });
        var ret = {};
        for (var name in cache) {
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
    load: function load(appPath, type, modules) {
        //if (modules.length) {
        var cache = {};
        modules.forEach(function (item) {
            cache[item] = {};
            var itemCache = CommonLoader.loadFiles(path.join(appPath, item, type));
            for (var name in itemCache) {
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

module.exports = CommonLoader;