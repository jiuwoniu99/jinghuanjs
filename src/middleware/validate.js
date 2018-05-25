import getController from '../core/helper/getController';
import getProps from '../core/helper/getProps';
import isArray from 'lodash/isArray';

const actionSymbol = PropValidate.name;

const defaultOptions = {};

/**
 *
 * @param options
 * @param app
 * @return {Function}
 * @constructor
 */
function MidValidate(options, app) {
    
    options = Object.assign({}, defaultOptions, options);
    
    return async (ctx, next) => {
        
        if (!ctx.module || !ctx.controller || !ctx.action) {
            return ctx.throw(404);
        }
        
        let instance = getProps(ctx, PropValidate, ctx.action);
        
        if (instance) {
            let {props} = instance;
            if (props && isArray(props.method)) {
                props.method.map((method) => {
                })
            }
        }
        
        await next();
    };
}

export default MidValidate;
