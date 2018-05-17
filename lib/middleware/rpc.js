'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _jsonRpcError = require('json-rpc-error');

var _jsonRpcError2 = _interopRequireDefault(_jsonRpcError);

var _jsonRpcResponse = require('json-rpc-response');

var _jsonRpcResponse2 = _interopRequireDefault(_jsonRpcResponse);

var _rawBody = require('raw-body');

var _rawBody2 = _interopRequireDefault(_rawBody);

var _inflation = require('inflation');

var _inflation2 = _interopRequireDefault(_inflation);

var _helper = require('../core/helper');

var _helper2 = _interopRequireDefault(_helper);

var _getController = require('../core/helper/getController');

var _getController2 = _interopRequireDefault(_getController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const log = (0, _debug2.default)('JH:middleware/rpc');
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

                let jsonStr = yield (0, _rawBody2.default)((0, _inflation2.default)(req), opts);

                try {
                    body = JSON.parse(jsonStr);
                } catch (e) {
                    ctx.body = new _jsonRpcResponse2.default(null, new _jsonRpcError2.default.ParseError(e.message));
                    return;
                }

                try {
                    if (body.jsonrpc !== '2.0' || !Object.prototype.hasOwnProperty.call(body, 'method') || !Object.prototype.hasOwnProperty.call(body, 'id')) {

                        log('JSON is not correct JSON-RPC2 request: %O', body);

                        ctx.body = new _jsonRpcResponse2.default(body.id || null, new _jsonRpcError2.default.InvalidRequest());
                        return;
                    }

                    let pathname = body.method || '';
                    pathname = pathname.split('.');

                    let [module, controller, action] = pathname;

                    if (!module || !controller || !action) {
                        ctx.body = new _jsonRpcResponse2.default(body.id || null, new _jsonRpcError2.default.MethodNotFound());
                        return;
                    }

                    ctx.module = module;
                    ctx.controller = controller;
                    ctx.action = action;
                    let instance = (0, _getController2.default)(ctx, symbol);
                    if (!instance) {
                        ctx.body = new _jsonRpcResponse2.default(body.id || null, new _jsonRpcError2.default.MethodNotFound());
                        return;
                    }

                    if (_helper2.default.isEmpty(instance.ctx)) {
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
                            ctx.body = new _jsonRpcResponse2.default(body.id || null, null, ctx.body);
                        } else if (ctx.status == 404) {
                            ctx.body = new _jsonRpcResponse2.default(body.id || null, new _jsonRpcError2.default.MethodNotFound());
                        } else {
                            ctx.body = new _jsonRpcResponse2.default(body.id || null, new _jsonRpcError2.default.InternalError(ctx.status));
                        }
                    }).catch(function (e) {
                        console.error(e);
                        ctx.body = new _jsonRpcResponse2.default(body.id || null, new _jsonRpcError2.default.InternalError(e.message));
                    });
                } catch (e) {
                    console.error(e);
                    ctx.body = new _jsonRpcResponse2.default(body.id || null, new _jsonRpcError2.default.InternalError(e.message));
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