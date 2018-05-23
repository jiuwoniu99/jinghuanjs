import debug from 'debug';
import JsonRpcError from 'json-rpc-error';
import JsonRpcResponse from 'json-rpc-response';
import inflate from 'inflation';
import helper from '../core/helper';
import getController from "../core/helper/getController";
import JSON from 'json5';
import isArray from 'lodash/isArray';

const log = debug('JH:middleware/rpc');
const {props: {rpc}} = jinghuan;
const symbol = rpc.name;


/**
 *
 * @param options
 * @param app
 * @return {Function}
 */
function SocketRpc(options, app) {
    
    
    /**
     *
     */
    return async function (ctx, next) {
        let pathname = ctx.path || '';
        let rpcpathname = options.path || '/rpc';
        let body;
        
        
        if (pathname.startsWith(rpcpathname)) {
            
            if (ctx.isMethod('MESSAGE')) {
                let json = {};
                
                try {
                    json = JSON.parse(ctx.message);
                } catch (e) {
                    ctx.body = (new JsonRpcResponse(null, new JsonRpcError.ParseError(e.message)));
                    return;
                }
                
                try {
                    if (json.jsonrpc !== '2.0'
                        || !Object.prototype.hasOwnProperty.call(json, 'method')
                        || !Object.prototype.hasOwnProperty.call(json, 'id')) {
                        
                        log('JSON is not correct JSON-RPC2 request: %O', json);
                        
                        ctx.body = (new JsonRpcResponse(json.id || null, new JsonRpcError.InvalidRequest()));
                        return;
                    }
                    
                    let pathname = json.method || '';
                    pathname = pathname.split('.');
                    
                    let [module, controller, action] = pathname;
                    
                    
                    if (!module || !controller || !action) {
                        ctx.body = (new JsonRpcResponse(json.id || null, new JsonRpcError.MethodNotFound()));
                        return;
                    }
                    
                    ctx.module = module;
                    ctx.controller = controller;
                    ctx.action = action;
                    let instance = getController(ctx, symbol);
                    if (!instance) {
                        ctx.body = (new JsonRpcResponse(json.id || null, new JsonRpcError.MethodNotFound()));
                        return;
                    }
                    
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
                                return actions[method].value.call(instance, {}, json.params || {});
                            } else if (actions[method].initializer) {
                                return actions[method].initializer.call(instance)({}, json.params || {});
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
                            ctx.body = (new JsonRpcResponse(json.id || null, null, ctx.body));
                        } else if (ctx.status == 404) {
                            ctx.body = (new JsonRpcResponse(json.id || null, new JsonRpcError.MethodNotFound()));
                        } else {
                            ctx.body = (new JsonRpcResponse(json.id || null, new JsonRpcError.InternalError(ctx.status)));
                        }
                    }).catch(e => {
                        console.error(e);
                        ctx.body = (new JsonRpcResponse(json.id || null, new JsonRpcError.InternalError(e.message)));
                    });
                    
                } catch (e) {
                    console.error(e);
                    ctx.body = (new JsonRpcResponse(json.id || null, new JsonRpcError.InternalError(e.message)));
                }
            }
        } else {
            await next();
        }
    };
};

export default SocketRpc;
