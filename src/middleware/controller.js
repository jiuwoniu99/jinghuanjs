import getController from '../core/helper/getController';

const {props: {action}} = jinghuan;
const symbol = action.name;

const defaultOptions = {};

function invokeController(options, app) {

    options = Object.assign({}, defaultOptions, options);

    return (ctx, next) => {

        if (!ctx.module || !ctx.controller || !ctx.action) {
            return ctx.throw(404);
        }

        let instance = getController(ctx, symbol);
        if (!instance) {
            return ctx.throw(404);
        }

        // let {controllers = {}} = app;
        // if (controllers) {
        //     controllers = controllers[ctx.module] || {};
        // }
        // let Controller = controllers[ctx.controller];
        //
        let actions = instance[symbol];
        //
        // if (!actions[ctx.action]) {
        //     return ctx.throw(404);
        // }
        //
        // //
        // if (helper.isEmpty(Controller)) {
        //     const emptyController = options.emptyController;
        //     if (emptyController && controllers[emptyController]) {
        //         Controller = controllers[emptyController];
        //     } else {
        //         return next();
        //     }
        // }
        //
        // const instance = new Controller(ctx);
        // if (helper.isEmpty(instance.ctx)) {
        //     instance.ctx = ctx;
        // }

        let promise = Promise.resolve();

        if (instance.__before) {
            promise = Promise.resolve(instance.__before());
        }

        //
        return promise.then(data => {
            if (data === false) {
                return false;
            }
            let action = ctx.action;
            if (actions[action]) {
                let param = ctx.param();
                let post = ctx.post();

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
            console.error(e);
        });
    };
}

export default invokeController;
