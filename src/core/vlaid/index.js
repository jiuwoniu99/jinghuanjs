import path from 'path';
import fs from 'fs-extra'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import isNull from 'lodash/isNull';
import keys from 'lodash/keys'
import merge from 'lodash/merge'
import preErrors from './errors';
import isFunction from 'lodash/isFunction';
import each from 'lodash/each';
//
import validator from 'validator'
import preRules from './rules.js';
import getProps from "../helper/getProps";
import helper from '../helper'

const METHOD_MAP = {
    GET: 'param',
    POST: 'post',
    FILE: 'file',
    PUT: 'post',
    DELETE: 'post',
    PATCH: 'post',
    LINK: 'post',
    UNLINK: 'post',
    // websocket onmessage
    MESSAGE: 'param',
};

/**
 *
 */
class Valid {
    validator = validator;
    basicType = ['int', 'string', 'float', 'array', 'object', 'boolean'];
    skippedValidNames = ['[value]', '[default]', '[trim]', '[method]', '[aliasName]', '[lang]', '[type]'];
    
    /**
     *
     * @param validName
     * @param parseValid
     * @param parseArgs
     */
    addRule(validName, parseValid, parseArgs) {
        if (isFunction(parseValid))
            preRules[validName] = parse;
        if (isFunction(parseArgs))
            preRules['_' + validName] = parseArgs;
    }
    
    /**
     *
     * @param ctx
     */
    ctx(ctx) {
        //let valid = getProps(ctx, PropValidate, ctx.action);
        //if (valid) {
        let rules = {};
        let validFile = path.join(jinghuan.APP_PATH, ctx.module, 'validate', ctx.controller, ctx.action + '.js')
        if (fs.pathExistsSync(validFile)) {
            rules = require(validFile);
        }
        return this.validate(ctx, rules);
        //}
    }
    
    /**
     *
     * @param ctx
     * @param rules
     * @param data
     * @return {*}
     */
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
                
                if (!isArray(option))
                    option = [option];
                
                values.push({
                    name,
                    value,
                    option,
                    validName,
                    lang,
                })
            })
        });
        
        each(values, (rule) => {
            let fn = preRules[rule.validName];
            let _fn = preRules['_' + rule.validName];
            let args = [];
            
            if (isFunction(_fn)) {
                args = _fn(rule.option.slice(), data)
            }
            if (isFunction(fn)) {
                let valid = fn(rule.value, ...args);
                
                if (!valid) {
                    errors.push(rule)
                }
            } else {
                throw new Error(rule.validName + ' valid method is not been configed');
            }
        })
        
        
        if (errors.length > 0) {
            return errors;
        } else {
            return true
        }
    }
    
    
    /**
     *
     * @param ctx
     * @param rule
     * @return {*}
     */
    getQueryMethod(ctx, rule) {
        let method = ctx.method.toUpperCase();
        return METHOD_MAP[method];
    }
    
    /**
     *
     * @return {*}
     */
    get rules() {
        return preRules;
    }
    
    /**
     *
     * @param data
     */
    getMessage(data) {
    
    }
}


export default Valid
