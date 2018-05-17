"use strict";

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _helper = require("../helper");

var _helper2 = _interopRequireDefault(_helper);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)(`JH:core/loader/sql[${process.pid}]`);

let loadFiles = function (dir) {
    const files = _helper2.default.getdirFiles(dir).filter(file => {
        return (/\.sql/.test(file)
        );
    });
    const cache = {};
    files.forEach(file => {
        const name = file.replace(/\\/g, '/').replace(/\.sql$/, '');
        const filepath = _path2.default.join(dir, file);
        log(`load file: ${filepath}`);
        cache[name] = _fs2.default.readFileSync(filepath, "utf-8");
    });
    return cache;
};

module.exports = function load(appPath, modules) {
    const cache = {};
    modules.forEach(item => {
        cache[item] = {};
        const itemCache = loadFiles(_path2.default.join(appPath, item, 'sql'));
        for (const name in itemCache) {
            cache[item][name] = itemCache[name];
        }
    });
    return cache;
};