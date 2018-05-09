import debug from 'debug';
import JsonRpcError from 'json-rpc-error'
import JsonRpcResponse from 'json-rpc-response';
import raw from "raw-body"
import inflate from "inflation"
import helper from "../core/helper"
import action from "../../props/action"

const log = debug('JH:middleware/rpc');
const symbol = action.name;

/**
 *
 * @param options
 * @param app
 * @return {Function}
 */
function invokeRpc(options, app) {
    /**
     *
     */
    return async function (ctx, next) {
        let pathname = ctx.path || '';
        if (pathname === '/rpc') {
            let req = ctx.req;
            let opts = {};
            let len = req.headers['content-length'];
            let encoding = req.headers['content-encoding'] || 'identity';
            let body = {};
            
            if (len && encoding === 'identity') opts.length = ~~len;
            opts.encoding = opts.encoding || 'utf8';
            opts.limit = opts.limit || '1mb';
            
            let jsonStr = await raw(inflate(req), opts);
            
            try {
                body = JSON.parse(jsonStr);
            } catch (e) {
                ctx.body = new JsonRpcResponse(null, new JsonRpcError.ParseError(e.message));
                return;
            }
            
            
            try {
                if (body.jsonrpc !== '2.0'
                    || !Object.prototype.hasOwnProperty.call(body, 'method')
                    || !Object.prototype.hasOwnProperty.call(body, 'id')) {
                    
                    log('JSON is not correct JSON-RPC2 request: %O', body);
                    
                    ctx.body = new JsonRpcResponse(body.id || null, new JsonRpcError.InvalidRequest());
                    return;
                }
                
                let pathname = body.method || '';
                pathname = pathname.split('.');
                
                let [module, controller, action] = pathname;
                
                ctx.module = module;
                ctx.controller = controller;
                ctx.action = action;
                
                if (!ctx.module || !ctx.controller || !ctx.action) {
                    ctx.body = new JsonRpcResponse(body.id || null, new JsonRpcError.MethodNotFound());
                    return;
                }
                
                let controllers = app.controllers || {};
                if (controllers) {
                    controllers = controllers[ctx.module] || {};
                }
                let Controller = controllers[ctx.controller];
                
                
                if (helper.isEmpty(Controller)) {
                    ctx.body = new JsonRpcResponse(body.id || null, new JsonRpcError.MethodNotFound());
                    return;
                }
                ctx.request.body = {};
                ctx.request.body.post = body.params || {};
                
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
                    if (actions[method]) {
                        if (actions[method].value) {
                            return actions[method].value.call(instance);
                        } else if (actions[method].initializer) {
                            return actions[method].initializer.call(instance)();
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
                    if (ctx.status == 200) {
                        ctx.body = new JsonRpcResponse(body.id || null, null, ctx.body);
                    }
                }).catch(e => {
                    ctx.body = new JsonRpcResponse(body.id || null, new JsonRpcError.InternalError(e.message));
                });
                
            } catch (e) {
                ctx.body = new JsonRpcResponse(body.id || null, new JsonRpcError.InternalError(e.message));
            }
        } else {
            await next();
        }
    };
};

export default invokeRpc;
