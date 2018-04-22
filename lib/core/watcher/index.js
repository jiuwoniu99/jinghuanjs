'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
//
var helper = require('../helper');
var assert = require('assert');
//const _ = require('lodash');
//
var debug = require('debug')('JH:core/watcher[' + process.pid + ']');

/**
 * default options
 * @type {Object}
 */
var defaultOptions = {
    //es is es6
    //ts is typescript
    //mjs NodeJs v9.0+
    allowExts: ['js', 'es', 'ts', 'mjs', 'sql', 'json'],
    filter: function filter(fileInfo, options) {
        var seps = fileInfo.file.split(path.sep);
        // filter hidden file
        var flag = seps.some(function (item) {
            return item[0] === '.';
        });
        if (flag) {
            return false;
        }
        var ext = path.extname(fileInfo.file).slice(1);
        return options.allowExts.indexOf(ext) !== -1;
    }
};

/**
 * watcher class
 */

var Watcher = function () {
    /**
     *
     * @param options
     * @param cb
     */
    function Watcher(options, cb) {
        _classCallCheck(this, Watcher);

        assert(helper.isFunction(cb), 'callback must be a function');
        options = this.buildOptions(options);

        debug('srcPath: ' + options.srcPath);
        debug('diffPath: ' + options.diffPath);

        this.options = options;
        this.cb = cb;
        this.lastMtime = {};
    }

    /**
     *
     * @param options
     * @return {{}}
     */


    Watcher.prototype.buildOptions = function buildOptions() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (helper.isString(options)) {
            options = { srcPath: options };
        }
        var srcPath = options.srcPath;
        assert(srcPath, 'srcPath can not be blank');
        if (!helper.isArray(srcPath)) {
            srcPath = [srcPath];
        }
        var diffPath = options.diffPath || [];
        if (!helper.isArray(diffPath)) {
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
    };

    /**
     *
     * @return {Array}
     */


    Watcher.prototype.getChangedFiles = function getChangedFiles() {
        var _this = this;

        var changedFiles = [];
        var options = this.options;
        options.srcPath.forEach(function (srcPath, index) {
            assert(path.isAbsolute(srcPath), 'srcPath must be an absolute path');
            var diffPath = options.diffPath[index];
            var srcFiles = helper.getdirFiles(srcPath).filter(function (file) {
                return options.filter({ path: srcPath, file: file }, options);
            });
            var diffFiles = [];
            if (diffPath) {
                diffFiles = helper.getdirFiles(diffPath).filter(function (file) {
                    return options.filter({ path: diffPath, file: file }, options);
                });
                _this.removeDeletedFiles(srcFiles, diffFiles, diffPath);
            }
            srcFiles.forEach(function (file) {
                var mtime = fs.statSync(path.join(srcPath, file)).mtime.getTime();
                if (diffPath) {
                    var diffFile = '';
                    diffFiles.some(function (dfile) {
                        if (_this.removeFileExtName(dfile) === _this.removeFileExtName(file)) {
                            diffFile = dfile;
                            return true;
                        }
                    });
                    var diffFilePath = path.join(diffPath, diffFile);
                    // compiled file exist
                    if (diffFile && helper.isFile(diffFilePath)) {
                        var diffmtime = fs.statSync(diffFilePath).mtime.getTime();
                        // if compiled file mtime is after than source file, return
                        if (diffmtime > mtime) {
                            return;
                        }
                    }
                }
                if (!_this.lastMtime[file] || mtime > _this.lastMtime[file]) {
                    _this.lastMtime[file] = mtime;
                    changedFiles.push({ path: srcPath, file: file });
                }
            });
        });
        return changedFiles;
    };

    /**
     *
     * @param srcFiles
     * @param diffFiles
     * @param diffPath
     */


    Watcher.prototype.removeDeletedFiles = function removeDeletedFiles(srcFiles, diffFiles, diffPath) {
        var _this2 = this;

        var srcFilesWithoutExt = srcFiles.map(function (file) {
            return _this2.removeFileExtName(file);
        });
        diffFiles.forEach(function (file) {
            var fileWithoutExt = _this2.removeFileExtName(file);
            if (srcFilesWithoutExt.indexOf(fileWithoutExt) === -1) {
                var filepath = path.join(diffPath, file);
                if (helper.isFile(filepath)) {
                    fs.unlinkSync(filepath);
                }
            }
        });
    };

    /**
     * remove file extname
     * @param {String} file
     */


    Watcher.prototype.removeFileExtName = function removeFileExtName(file) {
        return file.replace(/\.\w+$/, '');
    };

    /**
     * watch files change
     */


    Watcher.prototype.watch = function watch() {
        var _this3 = this;

        var detectFiles = function detectFiles() {
            var changedFiles = _this3.getChangedFiles();
            if (changedFiles.length) {
                changedFiles.forEach(function (item) {
                    debug('file changed: path=' + item.path + ', file=' + item.file);
                    _this3.cb(item);
                });
            }
            setTimeout(detectFiles, _this3.options.interval || 100);
        };
        detectFiles();
    };

    return Watcher;
}();

module.exports = Watcher;