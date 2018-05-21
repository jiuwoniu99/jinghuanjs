'use strict';

const fs = _safeRequire('fs');

const path = _safeRequire('path');

const crypto = _safeRequire('crypto');

const net = _safeRequire('net');

const cluster = _safeRequire('cluster');

const uuid = _safeRequire('uuid');

const ms = _safeRequire('ms');

const core = _safeRequire('core-util-is');

const {
    isArray,
    isBoolean,
    isNull,
    isNullOrUndefined,
    isNumber,
    isString,
    isSymbol,
    isUndefined,
    isRegExp,
    isObject,
    isDate,
    isError,
    isFunction,
    isPrimitive,
    isBuffer
} = core;
const fsRmdir = promisify(fs.rmdir, fs);
const fsUnlink = promisify(fs.unlink, fs);
const fsReaddir = promisify(fs.readdir, fs);

const numberReg = /^((-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
const toString = Object.prototype.toString;

exports.isIP = net.isIP;
exports.isIPv4 = net.isIPv4;
exports.isIPv6 = net.isIPv6;
exports.isMaster = cluster.isMaster;

exports.isArray = isArray;
exports.isBoolean = isBoolean;
exports.isNull = isNull;
exports.isNullOrUndefined = isNullOrUndefined;
exports.isNumber = isNumber;
exports.isString = isString;
exports.isSymbol = isSymbol;
exports.isUndefined = isUndefined;
exports.isRegExp = isRegExp;
exports.isObject = isObject;
exports.isDate = isDate;
exports.isError = isError;
exports.isFunction = isFunction;
exports.isPrimitive = isPrimitive;
exports.isBuffer = isBuffer;

exports.isObject = obj => {
    return toString.call(obj) === '[object Object]';
};

function isInt(value) {
    if (isNaN(value) || exports.isString(value)) {
        return false;
    }
    var x = parseFloat(value);
    return (x | 0) === x;
}

exports.isInt = isInt;

function promisify(fn, receiver) {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn.apply(receiver, [...args, (err, res) => {
                return err ? reject(err) : resolve(res);
            }]);
        });
    };
}

exports.promisify = promisify;

function extend(target = {}, ...args) {
    let i = 0;
    const length = args.length;
    let options;
    let name;
    let src;
    let copy;
    if (!target) {
        target = exports.isArray(args[0]) ? [] : {};
    }
    for (; i < length; i++) {
        options = args[i];
        if (!options) {
            continue;
        }
        for (name in options) {
            src = target[name];
            copy = options[name];
            if (src && src === copy) {
                continue;
            }
            if (exports.isArray(copy)) {
                target[name] = extend([], copy);
            } else if (exports.isObject(copy)) {
                target[name] = extend(src && exports.isObject(src) ? src : {}, copy);
            } else {
                target[name] = copy;
            }
        }
    }
    return target;
}

exports.extend = extend;

function camelCase(str) {
    if (str.indexOf('_') > -1) {
        str = str.replace(/_(\w)/g, (a, b) => {
            return b.toUpperCase();
        });
    }
    return str;
}

exports.camelCase = camelCase;

function snakeCase(str) {
    return str.replace(/([^A-Z])([A-Z])/g, function ($0, $1, $2) {
        return $1 + '_' + $2.toLowerCase();
    });
};
exports.snakeCase = snakeCase;

function isNumberString(obj) {
    if (!obj) {
        return false;
    }
    return numberReg.test(obj);
}

exports.isNumberString = isNumberString;

function isTrueEmpty(obj) {
    if (obj === undefined || obj === null || obj === '') {
        return true;
    }
    if (exports.isNumber(obj) && isNaN(obj)) {
        return true;
    }
    return false;
}

exports.isTrueEmpty = isTrueEmpty;

function isEmpty(obj) {
    if (isTrueEmpty(obj)) {
        return true;
    }
    if (exports.isRegExp(obj)) {
        return false;
    } else if (exports.isDate(obj)) {
        return false;
    } else if (exports.isError(obj)) {
        return false;
    } else if (exports.isArray(obj)) {
        return obj.length === 0;
    } else if (exports.isString(obj)) {
        return obj.length === 0;
    } else if (exports.isNumber(obj)) {
        return obj === 0;
    } else if (exports.isBoolean(obj)) {
        return !obj;
    } else if (exports.isObject(obj)) {
        for (const key in obj) {
            return false && key;
        }
        return true;
    }
    return false;
}

exports.isEmpty = isEmpty;

function defer() {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}

exports.defer = defer;

function md5(str) {
    return crypto.createHash('md5').update(str + '', 'utf8').digest('hex');
}

exports.md5 = md5;

function timeout(time = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

exports.timeout = timeout;

function escapeHtml(str) {
    return (str + '').replace(/[<>'"]/g, a => {
        switch (a) {
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quote;';
            case '\'':
                return '&#39;';
        }
    });
}

exports.escapeHtml = escapeHtml;

exports.uuid = function (version) {
    if (version === 'v1') {
        return uuid.v1();
    }
    return uuid.v4();
};

exports.parseAdapterConfig = (config = {}, ...extConfig) => {
    config = exports.extend({}, config);

    if (!config.type) {
        config.type = '_';
    }

    if (config.handle) {
        const type = config.type;
        delete config.type;
        config = { type, [type]: config };
    }
    extConfig = extConfig.map(item => {
        if (!item) {
            return {};
        }

        if (exports.isString(item)) {
            item = { type: item };
        }

        if (!item.type) {
            item = { type: config.type, [config.type]: item };
        }

        if (item.handle) {
            const type = item.type;
            delete item.type;
            item = { type, [type]: item };
        }
        return item;
    });

    config = exports.extend({}, config, ...extConfig);
    const value = config[config.type] || {};

    value.type = config.type;
    return value;
};

exports.ms = function (time) {
    if (typeof time === 'number') {
        return time;
    }
    const result = ms(time);
    if (result === undefined) {
        throw new Error(`jinghuan-ms('${time}') result is undefined`);
    }
    return result;
};

exports.omit = function (obj, props) {
    if (exports.isString(props)) {
        props = props.split(',');
    }
    const keys = Object.keys(obj);
    const result = {};
    keys.forEach(item => {
        if (props.indexOf(item) === -1) {
            result[item] = obj[item];
        }
    });
    return result;
};

function isExist(dir) {
    dir = path.normalize(dir);
    try {
        fs.accessSync(dir, fs.R_OK);
        return true;
    } catch (e) {
        return false;
    }
}

exports.isExist = isExist;

function isFile(filePath) {
    if (!isExist(filePath)) {
        return false;
    }
    try {
        const stat = fs.statSync(filePath);
        return stat.isFile();
    } catch (e) {
        return false;
    }
}

exports.isFile = isFile;

function isDirectory(filePath) {
    if (!isExist(filePath)) {
        return false;
    }
    try {
        const stat = fs.statSync(filePath);
        return stat.isDirectory();
    } catch (e) {
        return false;
    }
}

exports.isDirectory = isDirectory;

function chmod(p, mode = '0777') {
    if (!isExist(p)) {
        return false;
    }
    try {
        fs.chmodSync(p, mode);
        return true;
    } catch (e) {
        return false;
    }
}

exports.chmod = chmod;

function mkdir(dir, mode = '0777') {
    if (isExist(dir)) {
        return chmod(dir, mode);
    }
    const pp = path.dirname(dir);
    if (isExist(pp)) {
        try {
            fs.mkdirSync(dir, mode);
            return true;
        } catch (e) {
            return false;
        }
    }
    if (mkdir(pp, mode)) {
        return mkdir(dir, mode);
    }
    return false;
}

exports.mkdir = mkdir;

function getdirFiles(dir, prefix = '') {
    dir = path.normalize(dir);
    if (!fs.existsSync(dir)) {
        return [];
    }
    const files = fs.readdirSync(dir);
    let result = [];
    files.forEach(item => {
        const currentDir = path.join(dir, item);
        const stat = fs.statSync(currentDir);
        if (stat.isFile()) {
            result.push(path.join(prefix, item));
        } else if (stat.isDirectory()) {
            const cFiles = getdirFiles(currentDir, path.join(prefix, item));
            result = result.concat(cFiles);
        }
    });
    return result;
};

exports.getdirFiles = getdirFiles;

function rmdir(p, reserve) {
    if (!isDirectory(p)) {
        return Promise.resolve();
    }
    return fsReaddir(p).then(files => {
        const promises = files.map(item => {
            const filepath = path.join(p, item);
            if (isDirectory(filepath)) {
                return rmdir(filepath, false);
            }
            return fsUnlink(filepath);
        });
        return Promise.all(promises).then(() => {
            if (!reserve) {
                return fsRmdir(p);
            }
        });
    });
}

exports.rmdir = rmdir;

exports.isBuffer = Buffer.isBuffer;

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