import debug from 'debug';
import raw from "raw-body"
import inflate from "inflation"
import helper from "../core/helper"
import action from "../props/api"
import extend from 'lodash/extend'
import querystring from 'querystring';
import md5 from 'locutus/php/strings/md5';
import strtoupper from 'locutus/php/strings/strtoupper'
import ksort from 'locutus/php/array/ksort';
import crypto from 'crypto';
import JsonRpcError from "json-rpc-error";
import JsonRpcResponse from "json-rpc-response";

const log = debug('JH:middleware/api');
const symbol = action.name;

const error_code = {
    'API_ERROR_500': {code: 500, msg: '服务器异常'},
    //
    'API_CODE_THERE_MUST_BE_A_APPID': {code: 10000, msg: '必须有AppID'},
    'API_CODE_WRONG_APPID': {code: 10001, msg: '错误的AppID'},
    'API_CODE_SIGN_ERROR': {code: 10002, msg: '错误的签名'},
    'API_CODE_LACK_OF_TIME_PARAMETERS': {code: 10003, msg: '缺少"time"参数'},
    'API_CODE_LACK_OF_SIGN_PARAMETERS': {code: 10004, msg: '缺少"sign"参数'},
    'API_CODE_LACK_OF_APPID_PARAMETERS': {code: 10005, msg: '缺少"appid"参数'},
    'API_CODE_LACK_OF_METHOD_PARAMETERS': {code: 10006, msg: '缺少"method"参数'},
    //
    'API_CODE_TIME_PARAMETER_ERROR': {code: 10021, msg: '"time"参数错误'},
    'API_CODE_SIGN_PARAMETER_ERROR': {code: 10022, msg: '"sign"参数错误'},
    'API_CODE_APPID_PARAMETER_ERROR': {code: 10023, msg: '"appid"参数错误'},
    'API_CODE_TIME_OUT_ERROR': {code: 10024, msg: '签名已过期'},
    'API_CODE_TOKEN_ERROR': {code: 100025, msg: 'token错误'},
    'API_CODE_TOKEN_TIMEOUT_ERROR': {code: 10026, msg: 'token过期'},
    'API_CODE_TOKEN_INVALID_ERROR': {code: 10027, msg: 'token验证失败'},
    'API_CODE_POST_ERROR': {code: 10028, msg: '请使用POST请求'},
    'API_CODE_BIZ_CONTENT_ERROR': {code: 10029, msg: '参数错误'},
    'API_CODE_SECRET_TYPE_ERROR': {code: 10030, msg: '"biz_content"加密方式错误'},
    'API_CODE_METHOD_PARAMETER_ERROR': {code: 10031, msg: '"method"参数错误'},
    //
    'API_CODE_PARAMETER_ERROR': {code: 11000, msg: '"{0}"缺少参数'},
    'API_CODE_THE_DATA_HAS_ALREADY_EXISTED': {code: 11001, msg: '该sid数据已存在'},
    'API_CODE_DATA_DOES_NOT_EXIST': {code: 11002, msg: '该sid数据不存在'},
}

/**
 *
 * @param message
 * @param key
 * @return {string}
 */
const query_string = function (message) {
    let data = extend({}, message);
    ksort(data);
    let p = '', string = '';
    for (let i in data) {
        if (data[i]) {
            string += `${p}${i}=${data[i]}`;
            p = "&";
        }
    }
    return string;
}

/**
 *
 * @param err
 * @param field
 */
function error(ctx, err, field = null) {
    if (field == null) {
        ctx.body = {
            data: {}, extend: {}, msg: err.msg, status: err.code
        }
    }
    else {
        ctx.body = {
            data: {}, extend: {}, msg: err.msg.replace('{0}', field), status: err.code
        }
    }
}

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
        let apipathname = options.path || '/api';
        
        if (pathname === apipathname) {
            let timeout = options.timeout || false
            let table = options.table || 'jh_auth_user';
            let fields = options.fields || ['key', 'id', 'appid', 'secret'];
            let biz_json = {};
            
            //
            let req = ctx.req;
            let opts = {};
            let len = req.headers['content-length'];
            let encoding = req.headers['content-encoding'] || 'identity';
            let body = {};
            
            if (len && encoding === 'identity') opts.length = ~~len;
            opts.encoding = opts.encoding || 'utf8';
            opts.limit = opts.limit || '1mb';
            
            // post参数是api参数
            let post = querystring.parse(await raw(inflate(req), opts));
            // get参数是通用参数
            let param = extend({}, ctx.param());
            
            if (!param.method) {
                // 缺少"method"参数
                error(ctx, error_code.API_CODE_LACK_OF_METHOD_PARAMETERS);
                return;
            } else if (!param.time) {
                // 缺少"time"参数
                error(ctx, error_code.API_CODE_LACK_OF_TIME_PARAMETERS);
                return;
            } else if (!param.sign) {
                // 缺少"sign"参数
                error(ctx, error_code.API_CODE_LACK_OF_SIGN_PARAMETERS);
                return;
            } else if (!param.appid) {
                // 缺少"appid"参数
                error(ctx, error_code.API_CODE_LACK_OF_APPID_PARAMETERS);
                return;
            } else if (param.time.length != 10) {
                // "time"参数条件错误
                error(ctx, error_code.API_CODE_TIME_PARAMETER_ERROR);
                return;
            }
            //else if (param.time > time() + timeout) {
            //    // "time"参数条件错误
            //    error(ctx, error_code.API_CODE_TIME_PARAMETER_ERROR);
            //    return;
            //} else if (param.time < time() - timeout) {
            //    // 签名过期
            //    error(ctx, error_code.API_CODE_TIME_OUT_ERROR);
            //    return;
            //}
            else if (param.sign.length != 32) {
                // "sign"参数条件错误
                error(ctx, error_code.API_CODE_SIGN_PARAMETER_ERROR);
                return;
            } else if (param.appid.length != (options.app_length || 19) || !param.appid.startsWith(options.app_prefix || 'jh_')) {
                // "appid"参数条件错误
                error(ctx, error_code.API_CODE_APPID_PARAMETER_ERROR);
                return;
            }
            else if (!post.biz_content) {
                // 缺少"biz_content"
                error(ctx, error_code.API_CODE_POST_ERROR);
                return;
            }
            else {
                let {appid = null, sign = null, time = null, secret_type = null, method = null} = param;
                let {biz_content = null} = post;
                
                // 查询用户信息
                let user = await ctx.db('jh_auth_user')
                    .select(fields)
                    .where({appid})
                    .first();
                
                if (user) {
                    
                    let sign_data = {appid, time, secret_type, biz_content, key: user.key, method};
                    let sign_string = query_string(sign_data);
                    let check = strtoupper(md5(sign_string));
                    if (options.debug) {
                        ctx.slog.info('sign_string >> ' + sign_string);
                        ctx.slog.info('check >> ' + check);
                        ctx.slog.info('biz_content >> ' + biz_content);
                    }
                    
                    if (check !== sign) {
                        // 签名失败
                        error(ctx, error_code.API_CODE_SIGN_ERROR);
                        return;
                    }
                    
                    try {
                        // api参数是否加密
                        if (secret_type) {
                            switch (secret_type) {
                                // AES-128-CBC 加密 iv key 必须是16位 biz_content 必须是base64
                                case "AES-128-CBC": {
                                    let iv = user.secret;
                                    let key = new Buffer(md5(iv), 'hex');
                                    let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
                                    let decoded = decipher.update(biz_content, 'base64', 'utf8');
                                    decoded += decipher.final('utf8');
                                    this.biz_content = JSON.parse(decoded);
                                    break;
                                }
                                case "AES-256-CBC": {
                                    // AES-256-CBC 加密 iv 必须是16位 key 必须是32位 biz_content 必须是base64
                                    let iv = user.secret;
                                    let key = new Buffer(md5(iv));
                                    let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                                    let decoded = decipher.update(biz_content, 'base64', 'utf8');
                                    decoded += decipher.final('utf8');
                                    biz_json = JSON.parse(decoded);
                                    break;
                                }
                                default:
                                    // 加密方式错误
                                    error(ctx, error_code.API_CODE_SECRET_TYPE_ERROR);
                                    return;
                            }
                        } else {
                            biz_json = JSON.parse(post.biz_content);
                        }
                    } catch (e) {
                        console.error(e);
                        error(ctx, error_code.API_CODE_BIZ_CONTENT_ERROR);
                        return;
                    }
                    
                } else {
                    // 缺少"appid"参数
                    error(ctx, error_code.API_CODE_WRONG_APPID);
                    return;
                }
                
                let pathname = method || '';
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
                    error(ctx, error_code.API_CODE_METHOD_PARAMETER_ERROR);
                    return;
                }
                
                ctx.request.body = {};
                ctx.request.body.post = biz_json;
                
                const instance = new Controller(ctx);
                if (helper.isEmpty(instance.ctx)) {
                    instance.ctx = ctx;
                }
                instance.error_code = error_code;
                instance.user = user;
                
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
                        
                        let param = ctx.param();
                        //let post = ctx.post();
                        
                        if (actions[method].value) {
                            return actions[method].value.call(instance, param, biz_json);
                        } else if (actions[method].initializer) {
                            return actions[method].initializer.call(instance)(param, biz_json);
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
                    } else if (ctx.status == 404) {
                        error(ctx, error_code.API_CODE_METHOD_PARAMETER_ERROR);
                    } else {
                        error(ctx, error_code.API_ERROR_500);
                    }
                }).catch(e => {
                    console.error(e)
                    error(ctx, error_code.API_ERROR_500);
                });
            }
        } else {
            await next();
        }
    };
};

export default invokeRpc;
