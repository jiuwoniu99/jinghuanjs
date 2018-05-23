'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const getController = _safeRequire('../core/helper/getController');

const { props: { action } } = jinghuan;
const symbol = action.name;

const defaultOptions = {};

function MidController(options, app) {

    options = Object.assign({}, defaultOptions, options);

    return (ctx, next) => {

        if (!ctx.module || !ctx.controller || !ctx.action) {
            return ctx.throw(404);
        }

        let instance = getController(ctx, symbol);
        if (!instance) {
            return ctx.throw(404);
        }

        let actions = instance[symbol];


        let promise = Promise.resolve();

        if (instance.__before) {
            promise = Promise.resolve(instance.__before());
        }

        return promise.then(data => {
            if (data === false) {
                return false;
            }
            let action = ctx.action;
            if (actions[action]) {
                let param = ctx.param() || {};
                let post = ctx.post() || {};

                if (actions[action].value) {
                    return actions[action].value.call(instance, param, post);
                } else if (actions[action].initializer) {
                    return actions[action].initializer.call(instance)(param, post);
                }
            }
        }).then(data => {
            if (data === false) {
                return false;
            }
            if (instance.__after) {
                return instance.__after();
            }
        }).then(data => {
            if (data !== false) {
                return next();
            }
        }).catch(e => {
            ctx.status = 500;
            console.error(e);
        });
    };
}

exports.default = MidController;

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