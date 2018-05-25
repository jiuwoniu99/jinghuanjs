'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const path = _safeRequire('path');

const fs = _safeRequire('fs-extra');

const isArray = _safeRequire('lodash/isArray');

const isString = _safeRequire('lodash/isString');

const isNull = _safeRequire('lodash/isNull');

const keys = _safeRequire('lodash/keys');

const merge = _safeRequire('lodash/merge');

const preErrors = _safeRequire('./errors');

const isFunction = _safeRequire('lodash/isFunction');

const each = _safeRequire('lodash/each');

const validator = _safeRequire('validator');

const preRules = _safeRequire('./rules.js');

const getProps = _safeRequire('../helper/getProps');

const helper = _safeRequire('../helper');

const METHOD_MAP = {
    GET: 'param',
    POST: 'post',
    FILE: 'file',
    PUT: 'post',
    DELETE: 'post',
    PATCH: 'post',
    LINK: 'post',
    UNLINK: 'post',

    MESSAGE: 'param'
};

let Valid = class Valid {
    constructor() {
        this.validator = validator;
        this.basicType = ['int', 'string', 'float', 'array', 'object', 'boolean'];
        this.skippedValidNames = ['[value]', '[default]', '[trim]', '[method]', '[aliasName]', '[lang]', '[type]'];
    }

    addRule(validName, parseValid, parseArgs) {
        if (isFunction(parseValid)) preRules[validName] = parse;
        if (isFunction(parseArgs)) preRules['_' + validName] = parseArgs;
    }

    ctx(ctx) {
        let rules = {};
        let validFile = path.join(jinghuan.APP_PATH, ctx.module, 'validate', ctx.controller, ctx.action + '.js');
        if (fs.pathExistsSync(validFile)) {
            rules = _safeRequire(validFile);
        }
        return this.validate(ctx, rules);
    }

    validate(ctx, rules, data) {
        let errors = [];
        let values = [];
        let method = this.getQueryMethod(ctx);
        data = data || ctx[method]();

        each(rules, (rule, name) => {
            let lang = rule['[lang]'] || null;
            each(rule, (option, validName) => {
                if (this.skippedValidNames.indexOf(validName) >= 0) {
                    return;
                }
                let value = data[name] || null;

                if (!isArray(option)) option = [option];

                values.push({
                    name,
                    value,
                    option,
                    validName,
                    lang
                });
            });
        });

        each(values, rule => {
            let fn = preRules[rule.validName];
            let _fn = preRules['_' + rule.validName];
            let args = [];

            if (isFunction(_fn)) {
                args = _fn(rule.option.slice(), data);
            }
            if (isFunction(fn)) {
                let valid = fn(rule.value, ...args);

                if (!valid) {
                    errors.push(rule);
                }
            } else {
                throw new Error(rule.validName + ' valid method is not been configed');
            }
        });

        if (errors.length > 0) {
            return errors;
        } else {
            return true;
        }
    }

    getQueryMethod(ctx, rule) {
        let method = ctx.method.toUpperCase();
        return METHOD_MAP[method];
    }

    get rules() {
        return preRules;
    }

    getMessage(data) {}
};
exports.default = Valid;

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