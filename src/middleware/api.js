import debug from 'debug';
import JsonRpcError from 'json-rpc-error'
import JsonRpcResponse from 'json-rpc-response';
import raw from "raw-body"
import inflate from "inflation"
import helper from "../core/helper"
import action from "../../props/api"
import extend from 'lodash/extend'

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
    //
    'API_CODE_PARAMETER_ERROR': {code: 11000, msg: '"{0}"缺少参数'},
    'API_CODE_THE_DATA_HAS_ALREADY_EXISTED': {code: 11001, msg: '该sid数据已存在'},
    'API_CODE_DATA_DOES_NOT_EXIST': {code: 11002, msg: '该sid数据不存在'},
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
            
            //let req = ctx.req;
            //let opts = {};
            //let len = req.headers['content-length'];
            //let encoding = req.headers['content-encoding'] || 'identity';
            //let body = {};
            //
            //if (len && encoding === 'identity') opts.length = ~~len;
            //opts.encoding = opts.encoding || 'utf8';
            //opts.limit = opts.limit || '1mb';
            //
            //let jsonStr = await raw(inflate(req), opts);
            
            // post参数是api参数
            let post = extend({}, ctx.post());
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
            } else if (param.time > php.datetime.time() + timeout) {
                // "time"参数条件错误
                error(ctx, error_code.API_CODE_TIME_PARAMETER_ERROR);
                return;
            } else if (param.time < php.datetime.time() - timeout) {
                // 签名过期
                error(ctx, error_code.API_CODE_TIME_OUT_ERROR);
                return;
            } else if (param.sign.length != 32) {
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
            
            }
        } else {
            await next();
        }
    };
};

export default invokeRpc;
