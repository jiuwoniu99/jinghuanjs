"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

const helper = _safeRequire("../helper");

const path = _safeRequire("path");

const fs = _safeRequire("fs");

const assert = _safeRequire("assert");

const Debounce = _safeRequire("../debounce");

const debounceInstance = new Debounce();
const readFile = helper.promisify(fs.readFile, fs);
const writeFile = helper.promisify(fs.writeFile, fs);
const unlink = helper.promisify(fs.unlink, fs);

const getFilePath = Symbol('think-get-file-path');

let FileStore = class FileStore {
    constructor(storePath) {
        assert(storePath && path.isAbsolute(storePath), 'storePath need be an absolute path');
        this.storePath = storePath;
    }

    [getFilePath](relativePath) {
        const filePath = path.join(this.storePath, relativePath);
        assert(filePath.indexOf(this.storePath) === 0, 'the file should be in storePath');
        return filePath;
    }

    get(relativePath) {
        const filePath = this[getFilePath](relativePath);
        if (!helper.isFile(filePath)) {
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
                    return helper.timeout(10).then(() => {
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
        const res = helper.mkdir(path.dirname(filePath));
        assert(res, 'You don\'t have right to create file in the given path!');
        return writeFile(filePath, content).then(() => {
            return helper.chmod(filePath);
        });
    }

    delete(relativePath) {
        const filePath = this[getFilePath](relativePath);
        if (!helper.isFile(filePath)) {
            return Promise.resolve();
        }
        return unlink(filePath);
    }
};
exports.default = FileStore;

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