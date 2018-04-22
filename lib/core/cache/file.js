'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var helper = require('../helper');
var path = require('path');
var fs = require('fs');
var assert = require('assert');
var Debounce = require('../debounce');
var debounceInstance = new Debounce();
var readFile = helper.promisify(fs.readFile, fs);
var writeFile = helper.promisify(fs.writeFile, fs);
var unlink = helper.promisify(fs.unlink, fs);

var getFilePath = Symbol('think-get-file-path');

/**
 * file store
 */

var FileStore = function () {
    /**
     * constructor
     * @param {String} storePath store file root path
     */
    function FileStore(storePath) {
        _classCallCheck(this, FileStore);

        assert(storePath && path.isAbsolute(storePath), 'storePath need be an absolute path');
        this.storePath = storePath;
    }

    /**
     * get file path
     * @param  {String} relativePath [description]
     * @return {String}     [description]
     */


    FileStore.prototype[getFilePath] = function (relativePath) {
        var filePath = path.join(this.storePath, relativePath);
        assert(filePath.indexOf(this.storePath) === 0, 'the file should be in storePath');
        return filePath;
    };

    /**
     * get file data
     * @param  {String} relativePath   [relativePath]
     * @param  {Number} times [try times when can not get file content]
     * @return {Promise}       []
     */


    FileStore.prototype.get = function get(relativePath) {
        var filePath = this[getFilePath](relativePath);
        if (!helper.isFile(filePath)) {
            return Promise.resolve();
        }

        function getFileContent() {
            var times = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            return readFile(filePath, { encoding: 'utf8' }).then(function (content) {
                if (!content && times <= 3) {
                    return Promise.reject(new Error('content empty, file path is ' + filePath));
                }
                return content;
            }).catch(function (err) {
                if (times <= 3) {
                    return helper.timeout(10).then(function () {
                        return getFileContent(times + 1);
                    });
                }
                return Promise.reject(err);
            });
        }

        return debounceInstance.debounce(filePath, function () {
            return getFileContent();
        });
    };

    /**
     * set file content
     * @param {String} relativePath     [relativePath]
     * @param {String} content []
     */


    FileStore.prototype.set = function set(relativePath, content) {
        var filePath = this[getFilePath](relativePath);
        var res = helper.mkdir(path.dirname(filePath));
        assert(res, 'You don\'t have right to create file in the given path!');
        return writeFile(filePath, content).then(function () {
            return helper.chmod(filePath);
        });
    };

    /**
     * delete file
     * @param  {String} relativePath [relativePath]
     * @return {Promise}     []
     */


    FileStore.prototype.delete = function _delete(relativePath) {
        var filePath = this[getFilePath](relativePath);
        if (!helper.isFile(filePath)) {
            return Promise.resolve();
        }
        return unlink(filePath);
    };

    return FileStore;
}();

module.exports = FileStore;