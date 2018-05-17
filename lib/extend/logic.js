"use strict";

var _thinkValidator = require("think-validator");

var _thinkValidator2 = _interopRequireDefault(_thinkValidator);

var _helper = require("../core/helper");

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const VALIDATE_INVOKED = Symbol('logic-validate-invoked');

let validatorsRuleAdd = false;

module.exports = {
    validate(rules, msgs) {
        if (_helper2.default.isEmpty(rules)) return;
        this[VALIDATE_INVOKED] = true;

        if (!validatorsRuleAdd) {
            validatorsRuleAdd = true;
            const rules = jinghuan.app.validators.rules || {};
            for (const key in rules) {
                _thinkValidator2.default.addRule(key, rules[key]);
            }
        }
        const instance = new _thinkValidator2.default(this.ctx);
        msgs = Object.assign({}, jinghuan.app.validators.messages, msgs);
        if (_helper2.default.isObject(this.scope)) {
            rules = _helper2.default.extend(this.scope, rules);
        }
        const ret = instance.validate(rules, msgs);
        if (!_helper2.default.isEmpty(ret)) {
            this.validateErrors = ret;
            return false;
        }
        return true;
    },

    __after() {
        let allowMethods = this.allowMethods;
        if (!_helper2.default.isEmpty(allowMethods)) {
            if (_helper2.default.isString(allowMethods)) {
                allowMethods = allowMethods.split(',').map(e => {
                    return e.toUpperCase();
                });
            }
            const method = this.method;
            if (allowMethods.indexOf(method) === -1) {
                this.fail(this.config('validateDefaultErrno'), 'METHOD_NOT_ALLOWED');
                return false;
            }
        }

        if (!this[VALIDATE_INVOKED]) {
            if (_helper2.default.isObject(this.scope)) {
                this.rules = _helper2.default.extend(this.scope, this.rules);
            }
            if (!_helper2.default.isEmpty(this.rules)) {
                const flag = this.validate(this.rules);
                if (!flag) {
                    this.fail(this.config('validateDefaultErrno'), this.validateErrors);
                    return false;
                }
            }
        }
    }
};