import path from 'path';
import fs from 'fs-extra';
import getController from '../core/helper/getController';
import getProps from '../core/helper/getProps';

const actionSymbol = PropAction.name;
const validateSymbol = PropValidate.name;
const defaultOptions = {};

/**
 *
 * @param options
 * @param app
 * @return {Function}
 * @constructor
 */
function MidController(options, app) {
    
    options = Object.assign({}, defaultOptions, options);
    
    return (ctx, next) => {
        
        if (!ctx.module || !ctx.controller || !ctx.action) {
            return ctx.throw(404);
        }
        
        let instance = getController(ctx, actionSymbol);
        if (!instance) {
            return ctx.throw(404);
        }
        
        let errors = jinghuan.valid.ctx(ctx);
        let actions = instance[actionSymbol];
        let promise = Promise.resolve();
        let param = ctx.param() || {};
        let post = ctx.post() || {};
        
        if (instance.__before) {
            promise = Promise.resolve(instance.__before(param, post, errors));
        }
        //
        return promise.then(data => {
            if (data === false) {
                return false;
            }
            let action = ctx.action;
            if (actions[action]) {
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

export default MidController;
