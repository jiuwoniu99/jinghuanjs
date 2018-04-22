'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var net = require('net');
var cluster = require('cluster');
var uuid = require('uuid');
var ms = require('ms');

var _require = require('core-util-is'),
    isArray = _require.isArray,
    isBoolean = _require.isBoolean,
    isNull = _require.isNull,
    isNullOrUndefined = _require.isNullOrUndefined,
    isNumber = _require.isNumber,
    isString = _require.isString,
    isSymbol = _require.isSymbol,
    isUndefined = _require.isUndefined,
    isRegExp = _require.isRegExp,
    isObject = _require.isObject,
    isDate = _require.isDate,
    isError = _require.isError,
    isFunction = _require.isFunction,
    isPrimitive = _require.isPrimitive,
    isBuffer = _require.isBuffer;

var fsRmdir = promisify(fs.rmdir, fs);
var fsUnlink = promisify(fs.unlink, fs);
var fsReaddir = promisify(fs.readdir, fs);

var numberReg = /^((-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
var toString = Object.prototype.toString;

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

/**
 * override isObject method in `core-util-is` module
 */
exports.isObject = function (obj) {
    return toString.call(obj) === '[object Object]';
};

/**
 * check value is integer
 */
function isInt(value) {
    if (isNaN(value) || exports.isString(value)) {
        return false;
    }
    var x = parseFloat(value);
    return (x | 0) === x;
}

exports.isInt = isInt;

/**
 * make callback function to promise
 * @param  {Function} fn       []
 * @param  {Object}   receiver []
 * @return {Promise}            []
 */
function promisify(fn, receiver) {
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return new Promise(function (resolve, reject) {
            fn.apply(receiver, [].concat(args, [function (err, res) {
                return err ? reject(err) : resolve(res);
            }]));
        });
    };
}

exports.promisify = promisify;

/**
 * extend object
 * @return {Object} []
 */
function extend() {
    var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var i = 0;
    var length = arguments.length <= 1 ? 0 : arguments.length - 1;
    var options = void 0;
    var name = void 0;
    var src = void 0;
    var copy = void 0;
    if (!target) {
        target = exports.isArray(arguments.length <= 1 ? undefined : arguments[1]) ? [] : {};
    }
    for (; i < length; i++) {
        options = arguments.length <= i + 1 ? undefined : arguments[i + 1];
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

/**
 * camelCase string
 * @param  {String} str []
 * @return {String}     []
 */
function camelCase(str) {
    if (str.indexOf('_') > -1) {
        str = str.replace(/_(\w)/g, function (a, b) {
            return b.toUpperCase();
        });
    }
    return str;
}

exports.camelCase = camelCase;

/**
 * snakeCase string
 * @param  {String} str []
 * @return {String}     []
 */
function snakeCase(str) {
    return str.replace(/([^A-Z])([A-Z])/g, function ($0, $1, $2) {
        return $1 + '_' + $2.toLowerCase();
    });
};
exports.snakeCase = snakeCase;

/**
 * check object is number string
 * @param  {Mixed}  obj []
 * @return {Boolean}     []
 */
function isNumberString(obj) {
    if (!obj) return false;
    return numberReg.test(obj);
}

exports.isNumberString = isNumberString;

/**
 * true empty
 * @param  {Mixed} obj []
 * @return {Boolean}     []
 */
function isTrueEmpty(obj) {
    if (obj === undefined || obj === null || obj === '') return true;
    if (exports.isNumber(obj) && isNaN(obj)) return true;
    return false;
}

exports.isTrueEmpty = isTrueEmpty;

/**
 * check object is mepty
 * @param  {[Mixed]}  obj []
 * @return {Boolean}     []
 */
function isEmpty(obj) {
    if (isTrueEmpty(obj)) return true;
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
        for (var key in obj) {
            return false && key; // only for eslint
        }
        return true;
    }
    return false;
}

exports.isEmpty = isEmpty;

/**
 * get deferred object
 * @return {Object} []
 */
function defer() {
    var deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}

exports.defer = defer;

/**
 * get content md5
 * @param  {String} str [content]
 * @return {String}     [content md5]
 */
function md5(str) {
    return crypto.createHash('md5').update(str + '', 'utf8').digest('hex');
}

exports.md5 = md5;

/**
 * get timeout Promise
 * @param  {Number} time []
 * @return {[type]}      []
 */
function timeout() {
    var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;

    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

exports.timeout = timeout;

/**
 * escape html
 */
function escapeHtml(str) {
    return (str + '').replace(/[<>'"]/g, function (a) {
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

/**
 * get datetime
 * @param  {Date} date []
 * @return {String}      []
 */
function datetime() {
    var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();
    var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'YYYY-MM-DD HH:mm:ss';

    var fn = function fn(d) {
        return ('0' + d).slice(-2);
    };

    var d = new Date(date);
    var formats = {
        YYYY: d.getFullYear(),
        MM: fn(d.getMonth() + 1),
        DD: fn(d.getDate()),
        HH: fn(d.getHours()),
        mm: fn(d.getMinutes()),
        ss: fn(d.getSeconds())
    };

    return format.replace(/([a-z])\1+/ig, function (a) {
        return formats[a] || a;
    });
}

exports.datetime = datetime;

/**
 * generate uuid
 * @param  {String} version [uuid RFC version]
 * @return {String}         []
 */
exports.uuid = function (version) {
    if (version === 'v1') return uuid.v1();
    return uuid.v4();
};

/**
 * parse adapter config
 */
exports.parseAdapterConfig = function () {
    var _exports;

    for (var _len2 = arguments.length, extConfig = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        extConfig[_key2 - 1] = arguments[_key2];
    }

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    config = exports.extend({}, config);
    // {handle: ''}
    if (!config.type) config.type = '_';
    // {type: 'xxx', handle: ''}
    if (config.handle) {
        var _config;

        var type = config.type;
        delete config.type;
        config = (_config = { type: type }, _config[type] = config, _config);
    }
    extConfig = extConfig.map(function (item) {
        if (!item) return {};
        // only change type
        // 'xxx'
        if (exports.isString(item)) {
            item = { type: item };
        }
        // {handle: 'www'}
        // only add some configs
        if (!item.type) {
            var _item;

            item = (_item = { type: config.type }, _item[config.type] = item, _item);
        }
        // {type: 'xxx', handle: 'www'}
        if (item.handle) {
            var _item2;

            var _type = item.type;
            delete item.type;
            item = (_item2 = { type: _type }, _item2[_type] = item, _item2);
        }
        return item;
    });
    // merge config
    config = (_exports = exports).extend.apply(_exports, [{}, config].concat(extConfig));
    var value = config[config.type] || {};
    // add type for return value
    value.type = config.type;
    return value;
};
/**
 * transform humanize time to ms
 */
exports.ms = function (time) {
    if (typeof time === 'number') return time;
    var result = ms(time);
    if (result === undefined) {
        throw new Error('jinghuan-ms(\'' + time + '\') result is undefined');
    }
    return result;
};

/**
 * omit some props in object
 */
exports.omit = function (obj, props) {
    if (exports.isString(props)) {
        props = props.split(',');
    }
    var keys = Object.keys(obj);
    var result = {};
    keys.forEach(function (item) {
        if (props.indexOf(item) === -1) {
            result[item] = obj[item];
        }
    });
    return result;
};

/**
 * check path is exist
 */
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

/**
 * check filepath is file
 */
function isFile(filePath) {
    if (!isExist(filePath)) return false;
    try {
        var stat = fs.statSync(filePath);
        return stat.isFile();
    } catch (e) {
        return false;
    }
}

exports.isFile = isFile;

/**
 * check path is directory
 */
function isDirectory(filePath) {
    if (!isExist(filePath)) return false;
    try {
        var stat = fs.statSync(filePath);
        return stat.isDirectory();
    } catch (e) {
        return false;
    }
}

exports.isDirectory = isDirectory;

/**
 * change path mode
 * @param  {String} p    [path]
 * @param  {String} mode [path mode]
 * @return {Boolean}      []
 */
function chmod(p) {
    var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '0777';

    if (!isExist(p)) return false;
    try {
        fs.chmodSync(p, mode);
        return true;
    } catch (e) {
        return false;
    }
}

exports.chmod = chmod;

/**
 * make dir
 */
function mkdir(dir) {
    var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '0777';

    if (isExist(dir)) return chmod(dir, mode);
    var pp = path.dirname(dir);
    if (isExist(pp)) {
        try {
            fs.mkdirSync(dir, mode);
            return true;
        } catch (e) {
            return false;
        }
    }
    if (mkdir(pp, mode)) return mkdir(dir, mode);
    return false;
}

exports.mkdir = mkdir;

/**
 * get files in path
 * @param  {} dir    []
 * @param  {} prefix []
 * @return {}        []
 */
function getdirFiles(dir) {
    var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    dir = path.normalize(dir);
    if (!fs.existsSync(dir)) return [];
    var files = fs.readdirSync(dir);
    var result = [];
    files.forEach(function (item) {
        var currentDir = path.join(dir, item);
        var stat = fs.statSync(currentDir);
        if (stat.isFile()) {
            result.push(path.join(prefix, item));
        } else if (stat.isDirectory()) {
            var cFiles = getdirFiles(currentDir, path.join(prefix, item));
            result = result.concat(cFiles);
        }
    });
    return result;
};

exports.getdirFiles = getdirFiles;

/**
 * remove dir aync
 * @param  {String} p       [path]
 * @param  {Boolean} reserve []
 * @return {Promise}         []
 */
function rmdir(p, reserve) {
    if (!isDirectory(p)) return Promise.resolve();
    return fsReaddir(p).then(function (files) {
        var promises = files.map(function (item) {
            var filepath = path.join(p, item);
            if (isDirectory(filepath)) return rmdir(filepath, false);
            return fsUnlink(filepath);
        });
        return Promise.all(promises).then(function () {
            if (!reserve) return fsRmdir(p);
        });
    });
}

exports.rmdir = rmdir;

exports.isBuffer = Buffer.isBuffer;