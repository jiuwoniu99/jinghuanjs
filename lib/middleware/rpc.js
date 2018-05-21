'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = _safeRequire('debug');

const JsonRpcError = _safeRequire('json-rpc-error');

const JsonRpcResponse = _safeRequire('json-rpc-response');

const raw = _safeRequire('raw-body');

const inflate = _safeRequire('inflation');

const helper = _safeRequire('../core/helper');

const getController = _safeRequire('../core/helper/getController');

const log = debug('JH:middleware/rpc');
const { props: { rpc } } = jinghuan;
const symbol = rpc.name;

function invokeRpc(options, app) {
    return (() => {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            let pathname = ctx.path || '';
            let rpcpathname = options.path || '/rpc';

            if (pathname === rpcpathname) {
                let req = ctx.req;
                let opts = {};
                let len = req.headers['content-length'];
                let encoding = req.headers['content-encoding'] || 'identity';
                let body = {};

                if (len && encoding === 'identity') {
                    opts.length = ~~len;
                }
                opts.encoding = opts.encoding || 'utf8';
                opts.limit = opts.limit || '1mb';

                let jsonStr = yield raw(inflate(req), opts);

                try {
                    body = JSON.parse(jsonStr);
                } catch (e) {
                    ctx.body = new JsonRpcResponse(null, new JsonRpcError.ParseError(e.message));
                    return;
                }

                try {
                    if (body.jsonrpc !== '2.0' || !Object.prototype.hasOwnProperty.call(body, 'method') || !Object.prototype.hasOwnProperty.call(body, 'id')) {

                        log('JSON is not correct JSON-RPC2 request: %O', body);

                        ctx.body = new JsonRpcResponse(body.id || null, new JsonRpcError.InvalidRequest());
                        return;
                    }

                    let pathname = body.method || '';
                    pathname = pathname.split('.');

                    let [module, controller, action] = pathname;

                    if (!module || !controller || !action) {
                        ctx.body = new JsonRpcResponse(body.id || null, new JsonRpcError.MethodNotFound());
                        return;
                    }

                    ctx.module = module;
                    ctx.controller = controller;
                    ctx.action = action;
                    let instance = getController(ctx, symbol);
                    if (!instance) {
                        ctx.body = new JsonRpcResponse(body.id || null, new JsonRpcError.MethodNotFound());
                        return;
                    }

                    if (helper.isEmpty(instance.ctx)) {
                        instance.ctx = ctx;
                    }

                    ctx.request.body = {};
                    ctx.request.body.post = body.params || {};

                    let actions = instance[symbol] || {};

                    let promise = Promise.resolve();

                    if (instance.__before) {
                        promise = Promise.resolve(instance.__before());
                    }

                    return promise.then(function (data) {
                        if (data === false) {
                            return false;
                        }

                        let method = ctx.action;
                        if (actions[method]) {

                            let param = ctx.param();

                            if (actions[method].value) {
                                return actions[method].value.call(instance, param, body.params);
                            } else if (actions[method].initializer) {
                                return actions[method].initializer.call(instance)(param, body.params);
                            }
                        }
                    }).then(function (data) {
                        if (data === false) {
                            return false;
                        }
                        if (instance.__after) {
                            return instance.__after();
                        }
                    }).then(function (data) {
                        if (ctx.status == 200) {
                            ctx.body = new JsonRpcResponse(body.id || null, null, ctx.body);
                        } else if (ctx.status == 404) {
                            ctx.body = new JsonRpcResponse(body.id || null, new JsonRpcError.MethodNotFound());
                        } else {
                            ctx.body = new JsonRpcResponse(body.id || null, new JsonRpcError.InternalError(ctx.status));
                        }
                    }).catch(function (e) {
                        console.error(e);
                        ctx.body = new JsonRpcResponse(body.id || null, new JsonRpcError.InternalError(e.message));
                    });
                } catch (e) {
                    console.error(e);
                    ctx.body = new JsonRpcResponse(body.id || null, new JsonRpcError.InternalError(e.message));
                }
            } else {
                yield next();
            }
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
};

exports.default = invokeRpc;

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}