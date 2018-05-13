import helper from './index';

/**
 *
 * @param ctx
 */
export default function(ctx, symbol) {
    let {module, controller, action} = ctx;
    try {
        let file = jinghuan.app.controllers[module][controller];

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
