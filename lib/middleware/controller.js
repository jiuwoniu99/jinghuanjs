const helper = require('../core/helper');
const action = require('../decorators/action');

const symbol = action.name;

const defaultOptions = {
    emptyModule: '',
    emptyController: '',
    preSetStatus: 200
};

function invokeController(options, app) {

    options = Object.assign({}, defaultOptions, options);

    return (ctx, next) => {

        let controllers = app.controllers || {};

        if (!ctx.module || !ctx.controller || !ctx.action) {
            return ctx.throw(404);
        }

        //
        if (controllers) {
            // if (!controllers[ctx.module]) {
            //     ctx.module = options.emptyModule;
            // }
            controllers = controllers[ctx.module] || {};
        }
        let Controller = controllers[ctx.controller];

        //
        if (helper.isEmpty(Controller)) {
            const emptyController = options.emptyController;
            if (emptyController && controllers[emptyController]) {
                Controller = controllers[emptyController];
            } else {
                return next();
            }
        }

        const instance = new Controller(ctx);
        if (helper.isEmpty(instance.ctx)) {
            instance.ctx = ctx;
        }
        let actions = instance[symbol] || {};

        let promise = Promise.resolve();

        if (instance.__before) {
            promise = Promise.resolve(instance.__before());
        }

        //
        return promise.then(data => {
            if (data === false) {
                return false;
            }
            let method = ctx.action;
            // .replace(/_([a-zA-Z])/g, (a, b) => {
            //     return b.toUpperCase();
            // });

            // if (!actions[method]) {
            //     method = '__call';
            // }

            if (actions[method]) {
                // pre set request status
                if (ctx.body === undefined && options.preSetStatus) {
                    ctx.status = options.preSetStatus;
                }
                if (actions[method].value) {
                    return actions[method].value.call(instance);
                } else if (actions[method].initializer) {
                    return actions[method].initializer.call(instance)();
                } else {

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
        });
    };
}

module.exports = invokeController;
