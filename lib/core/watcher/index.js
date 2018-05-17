"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _helper = require("../helper");

var _helper2 = _interopRequireDefault(_helper);

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _isArray = require("lodash/isArray");

var _isArray2 = _interopRequireDefault(_isArray);

var _isString = require("lodash/isString");

var _isString2 = _interopRequireDefault(_isString);

var _isFunction = require("lodash/isFunction");

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)(`JH:core/watcher[${process.pid}]`);

const defaultOptions = {
    allowExts: ['js', 'es', 'ts', 'mjs', 'sql', 'json'],
    filter: (fileInfo, options) => {
        const seps = fileInfo.file.split(_path2.default.sep);

        const flag = seps.some(item => {
            return item[0] === '.';
        });
        if (flag) {
            return false;
        }
        const ext = _path2.default.extname(fileInfo.file).slice(1);
        return options.allowExts.indexOf(ext) !== -1;
    }
};

let Watcher = class Watcher {
    constructor(options, cb) {
        (0, _assert2.default)((0, _isFunction2.default)(cb), 'callback must be a function');
        options = this.buildOptions(options);

        log(`srcPath: ${options.srcPath}`);
        log(`diffPath: ${options.diffPath}`);

        this.options = options;
        this.cb = cb;
        this.lastMtime = {};
    }

    buildOptions(options = {}) {
        if ((0, _isString2.default)(options)) {
            options = { srcPath: options };
        }
        let srcPath = options.srcPath;
        (0, _assert2.default)(srcPath, 'srcPath can not be blank');
        if (!(0, _isArray2.default)(srcPath)) {
            srcPath = [srcPath];
        }
        let diffPath = options.diffPath || [];
        if (!(0, _isArray2.default)(diffPath)) {
            diffPath = [diffPath];
        }
        options.srcPath = srcPath;
        options.diffPath = diffPath;
        if (!options.filter) {
            options.filter = defaultOptions.filter;
        }
        if (!options.allowExts) {
            options.allowExts = defaultOptions.allowExts;
        }
        return options;
    }

    getChangedFiles() {
        const changedFiles = [];
        const options = this.options;
        options.srcPath.forEach((srcPath, index) => {
            (0, _assert2.default)(_path2.default.isAbsolute(srcPath), 'srcPath must be an absolute path');
            const diffPath = options.diffPath[index];
            const srcFiles = _helper2.default.getdirFiles(srcPath).filter(file => {
                return options.filter({ path: srcPath, file }, options);
            });
            let diffFiles = [];
            if (diffPath) {
                diffFiles = _helper2.default.getdirFiles(diffPath).filter(file => {
                    return options.filter({ path: diffPath, file }, options);
                });
                this.removeDeletedFiles(srcFiles, diffFiles, diffPath);
            }
            srcFiles.forEach(file => {
                const mtime = _fs2.default.statSync(_path2.default.join(srcPath, file)).mtime.getTime();
                if (diffPath) {
                    let diffFile = '';
                    diffFiles.some(dfile => {
                        if (this.removeFileExtName(dfile) === this.removeFileExtName(file)) {
                            diffFile = dfile;
                            return true;
                        }
                    });
                    const diffFilePath = _path2.default.join(diffPath, diffFile);

                    if (diffFile && _helper2.default.isFile(diffFilePath)) {
                        const diffmtime = _fs2.default.statSync(diffFilePath).mtime.getTime();

                        if (diffmtime > mtime) {
                            return;
                        }
                    }
                }
                if (!this.lastMtime[file] || mtime > this.lastMtime[file]) {
                    this.lastMtime[file] = mtime;
                    changedFiles.push({ path: srcPath, file });
                }
            });
        });
        return changedFiles;
    }

    removeDeletedFiles(srcFiles, diffFiles, diffPath) {
        const srcFilesWithoutExt = srcFiles.map(file => {
            return this.removeFileExtName(file);
        });
        diffFiles.forEach(file => {
            const fileWithoutExt = this.removeFileExtName(file);
            if (srcFilesWithoutExt.indexOf(fileWithoutExt) === -1) {
                const filepath = _path2.default.join(diffPath, file);
                if (_helper2.default.isFile(filepath)) {
                    _fs2.default.unlinkSync(filepath);
                }
            }
        });
    }

    removeFileExtName(file) {
        return file.replace(/\.\w+$/, '');
    }

    watch() {
        const detectFiles = () => {
            const changedFiles = this.getChangedFiles();
            if (changedFiles.length) {
                changedFiles.forEach(item => {
                    log(`file changed: path=${item.path}, file=${item.file}`);
                    this.cb(item);
                });
            }
            setTimeout(detectFiles, this.options.interval || 100);
        };
        detectFiles();
    }
};
exports.default = Watcher;