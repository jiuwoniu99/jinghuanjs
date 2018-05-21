"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

const fs = _safeRequire("fs");

const path = _safeRequire("path");

const helper = _safeRequire("../helper");

const assert = _safeRequire("assert");

const debug = _safeRequire("debug");

const isArray = _safeRequire("lodash/isArray");

const isString = _safeRequire("lodash/isString");

const isFunction = _safeRequire("lodash/isFunction");

const log = debug(`JH:core/watcher[${process.pid}]`);

const defaultOptions = {
    allowExts: ['js', 'es', 'ts', 'mjs', 'sql', 'json'],
    filter: (fileInfo, options) => {
        const seps = fileInfo.file.split(path.sep);

        const flag = seps.some(item => {
            return item[0] === '.';
        });
        if (flag) {
            return false;
        }
        const ext = path.extname(fileInfo.file).slice(1);
        return options.allowExts.indexOf(ext) !== -1;
    }
};

let Watcher = class Watcher {
    constructor(options, cb) {
        assert(isFunction(cb), 'callback must be a function');
        options = this.buildOptions(options);

        log(`srcPath: ${options.srcPath}`);
        log(`diffPath: ${options.diffPath}`);

        this.options = options;
        this.cb = cb;
        this.lastMtime = {};
    }

    buildOptions(options = {}) {
        if (isString(options)) {
            options = { srcPath: options };
        }
        let srcPath = options.srcPath;
        assert(srcPath, 'srcPath can not be blank');
        if (!isArray(srcPath)) {
            srcPath = [srcPath];
        }
        let diffPath = options.diffPath || [];
        if (!isArray(diffPath)) {
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
            assert(path.isAbsolute(srcPath), 'srcPath must be an absolute path');
            const diffPath = options.diffPath[index];
            const srcFiles = helper.getdirFiles(srcPath).filter(file => {
                return options.filter({ path: srcPath, file }, options);
            });
            let diffFiles = [];
            if (diffPath) {
                diffFiles = helper.getdirFiles(diffPath).filter(file => {
                    return options.filter({ path: diffPath, file }, options);
                });
                this.removeDeletedFiles(srcFiles, diffFiles, diffPath);
            }
            srcFiles.forEach(file => {
                const mtime = fs.statSync(path.join(srcPath, file)).mtime.getTime();
                if (diffPath) {
                    let diffFile = '';
                    diffFiles.some(dfile => {
                        if (this.removeFileExtName(dfile) === this.removeFileExtName(file)) {
                            diffFile = dfile;
                            return true;
                        }
                    });
                    const diffFilePath = path.join(diffPath, diffFile);

                    if (diffFile && helper.isFile(diffFilePath)) {
                        const diffmtime = fs.statSync(diffFilePath).mtime.getTime();

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
                const filepath = path.join(diffPath, file);
                if (helper.isFile(filepath)) {
                    fs.unlinkSync(filepath);
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