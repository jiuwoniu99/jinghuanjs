import helper from './index';
import get from 'lodash/get';

/**
 *
 * @param ctx
 * @param props
 * @param name
 * @return {*}
 */
export default function (ctx, props, name) {
    let {module, controller, action} = ctx;
    try {
        let file = get(jinghuan.controllers, `${module}.${controller}`);
        
        let Controller = require(file);
        if (helper.isEmpty(Controller)) {
            return false;
        }
        
        let prop = Controller.prototype[props.name];
        
        if (!prop || !prop[name]) {
            return false;
        }
        
        return prop[name];
    } catch (e) {
        return false;
    }
}
