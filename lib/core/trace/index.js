'use strict';

var statuses = require('statuses');
var sourceMapSupport = require('source-map-support');
//const _ = require('lodash');
//
var Tracer = require('./tracer');

module.exports = function (opts, app) {
    var tracer = new Tracer(opts);

    // source map support for compiled file
    if (opts && opts.sourceMap !== false) {
        sourceMapSupport.install();
    }

    var errorCallback = void 0;
    if (opts && helper.isFunction(opts.error)) {
        errorCallback = opts.error;
    } else {
        errorCallback = console.error.bind(console);
    }

    if (app) {
        app.jinghuan.beforeStartServer(function () {
            return tracer.getTemplateContent();
        });
    }

    return function (ctx, next) {
        var beforeTrace = app ? Promise.resolve() : tracer.getTemplateContent();

        return beforeTrace.then(next).then(function () {
            if (ctx.res.statusCode !== 404) {
                return true;
            }

            return ctx.throw(404, 'url `' + ctx.path + '` not found.');
        }).catch(function (err) {
            if (errorCallback(err, ctx) === false) {
                return Promise.resolve();
            }

            // default to 500
            if (typeof err.status !== 'number' || !statuses[err.status]) {
                err.status = 500;
            }

            // set status to forbidden reset status 200 during set body
            ctx.status = err.status;

            return tracer.run(ctx, err);
        });
    };
};