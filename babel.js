'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _findRoot = require('find-root');

var _findRoot2 = _interopRequireDefault(_findRoot);

var _set = require('lodash/set');

var _set2 = _interopRequireDefault(_set);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let paths = [];

function checkModule(name, option) {
    try {
        require.resolve(name, option.requireResolve);
    } catch (e) {
        console.log(`npm install ${name} --save-dev`);
        process.exit(0);
    }
}

const modules = ['babel-core', 'babel-preset-env', 'babel-preset-react', 'babel-preset-stage-0', 'babel-plugin-safe-require', 'babel-plugin-transform-decorators-legacy'];

module.exports = function (str, callback) {
    for (let i in modules) {
        checkModule(modules[i], { paths });
    }

    let rootPath;

    try {
        rootPath = (0, _findRoot2.default)(process.cwd());
    } catch (e) {
        console.log(`"${process.cwd()}" Not the nodejs project directory`);
        process.exit(0);
    }

    let srcPath = _path2.default.join(rootPath, 'src');

    if (!_fsExtra2.default.pathExistsSync(srcPath)) {
        console.log(`"${srcPath}" directory does not exist`);
        process.exit(0);
    }

    str = str.replace(/\//g, '.');
    let keys = str.split(',');
    let objects = {};

    for (let i in keys) {
        (0, _set2.default)(objects, keys[i], 1);
    }

    for (let app in objects) {
        let p1 = _path2.default.join(srcPath, app);

        if (!_fsExtra2.default.pathExistsSync(p1)) {
            console.log(`"${p1}" directory does not exist`);
            process.exit(0);
        }

        for (let dir in objects[app]) {
            let p2 = _path2.default.join(p1, dir);

            if (!_fsExtra2.default.pathExistsSync(p2)) {
                console.log(`"${p2}" directory does not exist`);
                process.exit(0);
            }
        }
    }

    console.log(objects);
};