'use strict';

const statuses = _safeRequire('statuses');
const sourceMapSupport = _safeRequire('source-map-support');

const Tracer = _safeRequire('./tracer');

module.exports = function (opts, app) {
    const tracer = new Tracer(opts);

    if (opts && opts.sourceMap !== false) {
        sourceMapSupport.install();
    }

    let errorCallback;
    if (opts && helper.isFunction(opts.error)) {
        errorCallback = opts.error;
    } else {
        errorCallback = console.error.bind(console);
    }

    if (app) {
        app.jinghuan.beforeStartServer(() => tracer.getTemplateContent());
    }

    return (ctx, next) => {
        const beforeTrace = app ? Promise.resolve() : tracer.getTemplateContent();

        return beforeTrace.then(next).then(() => {
            if (ctx.res.statusCode !== 404) {
                return true;
            }

            return ctx.throw(404, `url \`${ctx.path}\` not found.`);
        }).catch(err => {
            if (errorCallback(err, ctx) === false) {
                return Promise.resolve();
            }

            if (typeof err.status !== 'number' || !statuses[err.status]) {
                err.status = 500;
            }

            ctx.status = err.status;

            return tracer.run(ctx, err);
        });
    };
};

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule ? obj.default : obj;
}