'use strict';

var Validator = require('think-validator');
var helper = require('../core/helper');
//const _ = require('lodash');

var VALIDATE_INVOKED = Symbol('logic-validate-invoked');

var validatorsRuleAdd = false;

module.exports = {
    /**
     * validate rules
     */
    validate: function validate(rules, msgs) {
        if (helper.isEmpty(rules)) return;
        this[VALIDATE_INVOKED] = true;
        // add user defined rules
        if (!validatorsRuleAdd) {
            validatorsRuleAdd = true;
            var _rules = jinghuan.app.validators.rules || {};
            for (var key in _rules) {
                Validator.addRule(key, _rules[key]);
            }
        }
        var instance = new Validator(this.ctx);
        msgs = Object.assign({}, jinghuan.app.validators.messages, msgs);
        if (helper.isObject(this.scope)) {
            rules = helper.extend(this.scope, rules);
        }
        var ret = instance.validate(rules, msgs);
        if (!helper.isEmpty(ret)) {
            this.validateErrors = ret;
            return false;
        }
        return true;
    },

    /**
     * after magic method
     */
    __after: function __after() {
        // check request method is allowed
        var allowMethods = this.allowMethods;
        if (!helper.isEmpty(allowMethods)) {
            if (helper.isString(allowMethods)) {
                allowMethods = allowMethods.split(',').map(function (e) {
                    return e.toUpperCase();
                });
            }
            var method = this.method;
            if (allowMethods.indexOf(method) === -1) {
                this.fail(this.config('validateDefaultErrno'), 'METHOD_NOT_ALLOWED');
                return false;
            }
        }
        // check rules
        if (!this[VALIDATE_INVOKED]) {
            if (helper.isObject(this.scope)) {
                this.rules = helper.extend(this.scope, this.rules);
            }
            if (!helper.isEmpty(this.rules)) {
                var flag = this.validate(this.rules);
                if (!flag) {
                    this.fail(this.config('validateDefaultErrno'), this.validateErrors);
                    return false;
                }
            }
        }
    }
};