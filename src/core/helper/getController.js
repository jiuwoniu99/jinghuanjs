import helper from './index';
import get from 'lodash/get';

/**
 *
 * @param ctx
 * @param symbol
 * @param create
 * @return {*}
 */
export default function (ctx, symbol, create = true) {
    let {module, controller, action} = ctx;
    try {
        let file = get(jinghuan.controllers, `${module}.${controller}`);
        
        let Controller = require(file);
        if (helper.isEmpty(Controller)) {
            return false;
        }
        
        if (!Controller.prototype[symbol]) {
            return false;
        }
        if (create) {
            const instance = new Controller(ctx);
            if (helper.isEmpty(instance.ctx)) {
                instance.ctx = ctx;
            }
            
            return instance;
        } else {
            return Controller;
        }
        
    } catch (e) {
        return false;
    }
}
