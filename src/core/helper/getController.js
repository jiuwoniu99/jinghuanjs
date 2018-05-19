import helper from './index';

/**
 *
 * @param ctx
 * @param symbol
 * @param name
 * @return {*}
 */
export default function (ctx, symbol, name) {
    let {module, controller, action} = ctx;
    try {
        let file = jinghuan.controllers[module][controller];
        
        let Controller = require(file);
        if (helper.isEmpty(Controller)) {
            return false;
        }
        
        if (!Controller.prototype[symbol]) {
            return false;
        }
        
        const instance = new Controller(ctx);
        if (helper.isEmpty(instance.ctx)) {
            instance.ctx = ctx;
        }
        
        return instance;
    } catch (e) {
        return false;
    }
}
