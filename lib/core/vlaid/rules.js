'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const validator = _safeRequire('validator');

const empty = _safeRequire('locutus/php/var/empty');

const is_string = _safeRequire('locutus/php/var/is_string');

let Rules = {};
Rules.__validator = validator;

Rules.required = value => {
    return !empty(value) || value === '0' || value === 0;
};

Rules.requiredIf = (value, anotherField, ...values) => {
    if (values.indexOf(anotherField) > -1) {
        return Rules.required(value);
    }
    return true;
};

Rules._requiredIf = (args, data) => {
    let arg0 = args[0];
    args[0] = data[arg0] ? data[arg0] : '';
    return args;
};

Rules.requiredNotIf = (value, anotherField, ...values) => {
    if (values.indexOf(anotherField) === -1) {
        return Rules.required(value);
    }
    return true;
};

Rules._requiredNotIf = (args, data) => {
    return Rules._requiredIf(args, data);
};

Rules.requiredWith = (value, ...anotherFields) => {
    let flag = anotherFields.some(item => {
        return Rules.required(item);
    });
    if (flag) {
        return Rules.required(value);
    }
    return true;
};

Rules._requiredWith = (args, data) => {
    return args.map(item => {
        return data[item] ? data[item].value : '';
    });
};

Rules.requiredWithAll = (value, ...anotherFields) => {
    let flag = anotherFields.every(item => {
        return Rules.required(item);
    });
    if (flag) {
        return Rules.required(value);
    }
    return true;
};

Rules._requiredWithAll = (args, data) => {
    return Rules._requiredWith(args, data);
};

Rules.requiredWithout = (value, ...anotherFields) => {
    let flag = anotherFields.some(item => {
        return !Rules.required(item);
    });
    if (flag) {
        return Rules.required(value);
    }
    return true;
};

Rules._requiredWithout = (args, data) => {
    return Rules._requiredWith(args, data);
};

Rules.requiredWithoutAll = (value, ...anotherFields) => {
    let flag = anotherFields.every(item => {
        return !Rules.required(item);
    });
    if (flag) {
        return Rules.required(value);
    }
    return true;
};

Rules._requiredWithoutAll = (args, data) => {
    return Rules._requiredWith(args, data);
};

Rules.contains = (value, str) => {
    return !value || validator.contains(value, str);
};

Rules.equals = (value, comparison) => {
    return !value || validator.equals(value, comparison);
};

Rules._equals = (args, data) => {
    let item = data[args[0]];
    return [item ? item.value : ''];
};

Rules.equalsValue = (value, comparison) => {
    return !value || validator.equals(value, comparison);
};

Rules.different = (value, comparison) => {
    return !value || value !== comparison;
};

Rules._different = (args, data) => {
    return Rules._equals(args, data);
};

Rules.after = (value, date) => {
    return !value || validator.isAfter(value, date);
};

Rules._after = (args, data) => {
    let arg = args[0];
    if (arg in data) {
        return [data[arg].value];
    }
    return args;
};

Rules.alpha = value => {
    return !value || validator.isAlpha(value);
};

Rules.alphaDash = value => {
    return !value || /^[A-Z_]+$/i.test(value);
};

Rules.alphaNumeric = value => {
    return !value || validator.isAlphanumeric(value);
};

Rules.alphaNumericDash = value => {
    return !value || /^\w+$/i.test(value);
};

Rules.ascii = value => {
    return !value || validator.isAscii(value);
};

Rules.base64 = value => {
    return !value || validator.isBase64(value);
};

Rules.before = (value, date) => {
    return !value || validator.isBefore(value, date);
};

Rules._before = (args, data) => {
    return Rules._after(args, data);
};

Rules.byteLength = (value, min, max) => {
    return !value || validator.isByteLength(value, min, max);
};

Rules.creditcard = value => {
    return !value || validator.isCreditCard(value);
};

Rules.currency = (value, options) => {
    return !value || validator.isCurrency(value, options);
};

Rules.date = value => {
    return !value || validator.isDate(value);
};

Rules.decimal = value => {
    return !value || validator.isDecimal(value);
};

Rules.divisibleBy = (value, number) => {
    return !value || validator.isDivisibleBy(value, number);
};

Rules.email = (value, options) => {
    return !value || validator.isEmail(value, options);
};

Rules.fqdn = (value, options) => {
    return !value || validator.isFQDN(value, options);
};

Rules.float = (value, min, max) => {
    if (!value) {
        return true;
    }
    let options = {};
    if (min) {
        options.min = parseFloat(min);
    }
    if (max) {
        options.max = parseFloat(max);
    }
    return validator.isFloat(value, options);
};

Rules.fullWidth = value => {
    return !value || validator.isFullWidth(value);
};

Rules.halfWidth = value => {
    return !value || validator.isHalfWidth(value);
};

Rules.hexColor = value => {
    return !value || validator.isHexColor(value);
};

Rules.hex = value => {
    return !value || validator.isHexadecimal(value);
};

Rules.ip = value => {
    return !value || !!net.isIP(value);
};

Rules.ip4 = value => {
    return !value || net.isIPv4(value);
};

Rules.ip6 = value => {
    return !value || net.isIPv6(value);
};

Rules.isbn = (value, version) => {
    return !value || validator.isISBN(value, version);
};

Rules.isin = value => {
    return !value || validator.isISIN(value);
};

Rules.iso8601 = value => {
    return !value || validator.isISO8601(value);
};

Rules.in = (value, ...values) => {
    return !value || validator.isIn(value, values);
};

Rules.notIn = (value, ...values) => {
    return !value || !validator.isIn(value, values);
};

Rules.int = (value, min, max) => {
    if (!value) {
        return true;
    }
    let options = {};
    if (min) {
        options.min = min | 0;
    }
    if (max) {
        options.max = max | 0;
    }
    return !isNaN(value) && validator.isInt(value, options);
};

Rules.min = (value, min) => {
    return !value || validator.isInt(value, {
        min: min | 0
    });
};

Rules.max = (value, max) => {
    return !value || validator.isInt(value, {
        min: 0,
        max: max | 0
    });
};

Rules.length = (value, min, max) => {
    if (!value) {
        return true;
    }
    if (min) {
        min = min | 0;
    } else {
        min = 1;
    }
    if (max) {
        max = max | 0;
    }
    return validator.isLength(value, min, max);
};

Rules.minLength = (value, min) => {
    return !value || validator.isLength(value, min | 0);
};

Rules.maxLength = (value, max) => {
    return !value || validator.isLength(value, 0, max | 0);
};

Rules.lowercase = value => {
    return !value || validator.isLowercase(value);
};

Rules.mobile = (value, locale = 'zh-CN') => {
    return !value || validator.isMobilePhone(value, locale);
};

Rules.mongoId = value => {
    return !value || validator.isMongoId(value);
};

Rules.multibyte = value => {
    return !value || validator.isMultibyte(value);
};

Rules.url = (value, options) => {
    if (!value) {
        return true;
    }
    options = $.extend({
        require_protocol: true,
        protocols: ['http', 'https']
    }, options);
    return validator.isURL(value, options);
};

Rules.uppercase = value => {
    return !value || validator.isUppercase(value);
};

Rules.variableWidth = value => {
    return !value || validator.isVariableWidth(value);
};

Rules.order = value => {
    if (!value) {
        return true;
    }
    return value.split(/\s*,\s*/).every(item => {
        return (/^\w+\s+(?:ASC|DESC)$/i.test(item)
        );
    });
};

Rules.field = value => {
    if (!value) {
        return true;
    }
    return value.split(/\s*,\s*/).every(item => {
        return item === '*' || /^\w+$/.test(item);
    });
};

Rules.image = value => {
    if (!value) {
        return true;
    }
    if (is_object(value)) {
        value = value.originalFilename;
    }
    return (/\.(?:jpeg|jpg|png|bmp|gif|svg)$/i.test(value)
    );
};

Rules.startWith = (value, str) => {
    return !value || value.indexOf(str) === 0;
};

Rules.endWith = (value, str) => {
    return !value || value.lastIndexOf(str) === value.length - str.length;
};

Rules.string = value => {
    return is_string(value);
};

Rules.array = value => {
    return is_array(value);
};

Rules.boolean = value => {
    return is_bool(value);
};

Rules.object = value => {
    return is_object(value);
};

Rules.regexp = (value, reg) => {
    if (!value) {
        return true;
    }
    return reg.test(value);
};

Rules.type = (value, type) => {
    if (!value) {
        return true;
    }
    switch (type) {
        case 'int':
            return Rules.int(value);
        case 'float':
            return Rules.float(value);
        case 'boolean':
            return Rules.boolean(value);
        case 'array':
            return Rules.array(value);
        case 'object':
            return Rules.object(value);
    }
    return Rules.string(value);
};
Rules._type = (args, data) => {
    return args;
};

Rules.price = value => {
    if (value == '0') return true;
    return (/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(value)
    );
};

Rules._minCount = (args, data) => {
    return [data[args[0]].value];
};

Rules.minCount = (value, type) => {
    return (parseInt(value) || 0) < parseInt(type);
};

Rules._eqCount = (args, data) => {
    var count = 0;
    if (args.forEach) {
        args.forEach(function (item, key) {
            count += parseInt(data[item].value) || 0;
        });
    }
    return [count];
};

Rules.eqCount = (value, type) => {
    return (parseInt(value) || 0) == parseInt(type);
};

Rules.md5 = value => {
    value = validator.toString(value);
    return validator.isMD5(value);
};
exports.default = Rules;

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