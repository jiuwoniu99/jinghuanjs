'use strict';

var helper = require('../core/helper');
var action = require('../decorators/action');

var symbol = action.name;

var defaultOptions = {
    emptyModule: '',
    emptyController: '',
    preSetStatus: 200
};

function invokeController(options, app) {

    options = Object.assign({}, defaultOptions, options);

    return function (ctx, next) {

        var controllers = app.controllers || {};

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
        var Controller = controllers[ctx.controller];

        //
        if (helper.isEmpty(Controller)) {
            var emptyController = options.emptyController;
            if (emptyController && controllers[emptyController]) {
                Controller = controllers[emptyController];
            } else {
                return next();
            }
        }

        var instance = new Controller(ctx);
        if (helper.isEmpty(instance.ctx)) {
            instance.ctx = ctx;
        }
        var actions = instance[symbol] || {};

        var promise = Promise.resolve();

        if (instance.__before) {
            promise = Promise.resolve(instance.__before());
        }

        //
        return promise.then(function (data) {
            if (data === false) {
                return false;
            }
            var method = ctx.action;
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
                } else {}
            }
        }).then(function (data) {
            if (data === false) {
                return false;
            }
            if (instance.__after) {
                return instance.__after();
            }
        }).then(function (data) {
            if (data !== false) {
                return next();
            }
        });
    };
}

module.exports = invokeController;