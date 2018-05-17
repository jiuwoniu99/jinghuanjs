"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helper = require("../helper");

var _helper2 = _interopRequireDefault(_helper);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _debounce = require("../debounce");

var _debounce2 = _interopRequireDefault(_debounce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debounceInstance = new _debounce2.default();
const readFile = _helper2.default.promisify(_fs2.default.readFile, _fs2.default);
const writeFile = _helper2.default.promisify(_fs2.default.writeFile, _fs2.default);
const unlink = _helper2.default.promisify(_fs2.default.unlink, _fs2.default);

const getFilePath = Symbol('think-get-file-path');

let FileStore = class FileStore {
    constructor(storePath) {
        (0, _assert2.default)(storePath && _path2.default.isAbsolute(storePath), 'storePath need be an absolute path');
        this.storePath = storePath;
    }

    [getFilePath](relativePath) {
        const filePath = _path2.default.join(this.storePath, relativePath);
        (0, _assert2.default)(filePath.indexOf(this.storePath) === 0, 'the file should be in storePath');
        return filePath;
    }

    get(relativePath) {
        const filePath = this[getFilePath](relativePath);
        if (!_helper2.default.isFile(filePath)) {
            return Promise.resolve();
        }

        function getFileContent(times = 1) {
            return readFile(filePath, { encoding: 'utf8' }).then(content => {
                if (!content && times <= 3) {
                    return Promise.reject(new Error(`content empty, file path is ${filePath}`));
                }
                return content;
            }).catch(err => {
                if (times <= 3) {
                    return _helper2.default.timeout(10).then(() => {
                        return getFileContent(times + 1);
                    });
                }
                return Promise.reject(err);
            });
        }

        return debounceInstance.debounce(filePath, () => getFileContent());
    }

    set(relativePath, content) {
        const filePath = this[getFilePath](relativePath);
        const res = _helper2.default.mkdir(_path2.default.dirname(filePath));
        (0, _assert2.default)(res, 'You don\'t have right to create file in the given path!');
        return writeFile(filePath, content).then(() => {
            return _helper2.default.chmod(filePath);
        });
    }

    delete(relativePath) {
        const filePath = this[getFilePath](relativePath);
        if (!_helper2.default.isFile(filePath)) {
            return Promise.resolve();
        }
        return unlink(filePath);
    }
};
exports.default = FileStore;