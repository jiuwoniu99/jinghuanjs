'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = _safeRequire('debug');

const raw = _safeRequire('raw-body');

const inflate = _safeRequire('inflation');

const helper = _safeRequire('../core/helper');

const extend = _safeRequire('lodash/extend');

const parse_str = _safeRequire('locutus/php/strings/parse_str');

const md5 = _safeRequire('locutus/php/strings/md5');

const strtoupper = _safeRequire('locutus/php/strings/strtoupper');

const ksort = _safeRequire('locutus/php/array/ksort');

const crypto = _safeRequire('crypto');

const getController = _safeRequire('../core/helper/getController');

const log = debug('JH:middleware/api');
const symbol = jinghuan.props.api.name;

const error_code = {
    'API_ERROR_500': { code: 500, msg: '服务器异常' },

    'API_CODE_THERE_MUST_BE_A_APPID': { code: 10000, msg: '必须有AppID' },
    'API_CODE_WRONG_APPID': { code: 10001, msg: '错误的AppID' },
    'API_CODE_SIGN_ERROR': { code: 10002, msg: '错误的签名' },
    'API_CODE_LACK_OF_TIME_PARAMETERS': { code: 10003, msg: '缺少 "time" 参数' },
    'API_CODE_LACK_OF_SIGN_PARAMETERS': { code: 10004, msg: '缺少 "sign" 参数' },
    'API_CODE_LACK_OF_APPID_PARAMETERS': { code: 10005, msg: '缺少 "appid" 参数' },
    'API_CODE_LACK_OF_METHOD_PARAMETERS': { code: 10006, msg: '缺少 "method" 参数' },

    'API_CODE_TIME_PARAMETER_ERROR': { code: 10021, msg: '参数 "time" 错误' },
    'API_CODE_SIGN_PARAMETER_ERROR': { code: 10022, msg: '参数 "sign" 错误' },
    'API_CODE_APPID_PARAMETER_ERROR': { code: 10023, msg: '参数 "appid" 错误' },
    'API_CODE_TIME_OUT_ERROR': { code: 10024, msg: '签名已过期' },
    'API_CODE_TOKEN_ERROR': { code: 100025, msg: 'token错误' },
    'API_CODE_TOKEN_TIMEOUT_ERROR': { code: 10026, msg: 'token过期' },
    'API_CODE_TOKEN_INVALID_ERROR': { code: 10027, msg: 'token验证失败' },
    'API_CODE_POST_ERROR': { code: 10028, msg: '请使用POST请求' },
    'API_CODE_BIZ_CONTENT_ERROR': { code: 10029, msg: '参数错误' },
    'API_CODE_SECRET_TYPE_ERROR': { code: 10030, msg: '"biz_content"加密方式错误' },
    'API_CODE_METHOD_PARAMETER_ERROR': { code: 10031, msg: '参数 "method" 错误' },

    'API_CODE_PARAMETER_ERROR': { code: 11000, msg: '缺少 "{0}" 参数' },
    'API_CODE_THE_DATA_HAS_ALREADY_EXISTED': { code: 11001, msg: '该sid数据已存在' },
    'API_CODE_DATA_DOES_NOT_EXIST': { code: 11002, msg: '该sid数据不存在' },

    'API_CODE_UNAUTHORIZED': { code: 12000, msg: '该功能未授权' }
};

const query_string = function (message) {
    let data = extend({}, message);
    ksort(data);
    let p = '',
        string = '';
    for (let i in data) {
        if (data[i]) {
            string += `${p}${i}=${data[i]}`;
            p = '&';
        }
    }
    return string;
};

function error(ctx, err, field = null) {
    if (field == null) {
        ctx.body = {
            data: {}, extend: {}, msg: err.msg, status: err.code
        };
    } else {
        ctx.body = {
            data: {}, extend: {}, msg: err.msg.replace('{0}', field), status: err.code
        };
    }
}

function invokeApi(options, app) {
    return (() => {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            let pathname = ctx.path || '';
            let apipathname = options.path || '/api';

            if (pathname === apipathname) {
                let timeout = options.timeout || false;
                let table = options.table || 'jh_auth_user';
                let db = options.db || 'default';
                let fields = options.fields || ['key', 'id', 'appid', 'secret'];
                let biz_json = {};

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

                let post = {};
                parse_str((yield raw(inflate(req), opts)), post);

                let param = extend({}, ctx.param());

                if (!param.method) {
                    error(ctx, error_code.API_CODE_LACK_OF_METHOD_PARAMETERS);
                    return;
                } else if (!param.time) {
                    error(ctx, error_code.API_CODE_LACK_OF_TIME_PARAMETERS);
                    return;
                } else if (!param.sign) {
                    error(ctx, error_code.API_CODE_LACK_OF_SIGN_PARAMETERS);
                    return;
                } else if (!param.appid) {
                    error(ctx, error_code.API_CODE_LACK_OF_APPID_PARAMETERS);
                    return;
                } else if (param.time.length != 10) {
                    error(ctx, error_code.API_CODE_TIME_PARAMETER_ERROR);
                    return;
                } else if (param.sign.length != 32) {
                        error(ctx, error_code.API_CODE_SIGN_PARAMETER_ERROR);
                        return;
                    } else if (param.appid.length != (options.app_length || 19) || !param.appid.startsWith(options.app_prefix || 'jh_')) {
                        error(ctx, error_code.API_CODE_APPID_PARAMETER_ERROR);
                        return;
                    } else if (!post.biz_content) {
                        error(ctx, error_code.API_CODE_POST_ERROR);
                        return;
                    } else {
                        let { appid = null, sign = null, time = null, secret_type = null, method = null } = param;
                        let { biz_content = null } = post;
                        let user;

                        try {
                            user = yield ctx.db(table).select(fields).where({ appid }).first();
                        } catch (e) {
                            ctx.slog.info(e.message);
                        }

                        if (user) {

                            let sign_data = { appid, time, secret_type, biz_content, key: user.key, method };
                            let sign_string = query_string(sign_data);
                            let check = strtoupper(md5(sign_string));

                            if (options.debug) {
                                ctx.slog.info('sign_string >> ' + sign_string);
                                ctx.slog.info('check >> ' + check);
                                ctx.slog.info('biz_content >> ' + biz_content);
                            }

                            if (strtoupper(check) !== strtoupper(sign)) {
                                error(ctx, error_code.API_CODE_SIGN_ERROR);
                                return;
                            }

                            try {
                                if (secret_type) {
                                    switch (secret_type) {
                                        case 'AES-128-CBC':
                                            {
                                                let iv = user.secret;
                                                let key = new Buffer(md5(iv), 'hex');
                                                let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
                                                let decoded = decipher.update(biz_content, 'base64', 'utf8');
                                                decoded += decipher.final('utf8');
                                                this.biz_content = JSON.parse(decoded);
                                                break;
                                            }
                                        case 'AES-256-CBC':
                                            {
                                                let iv = user.secret;
                                                let key = new Buffer(md5(iv));
                                                let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                                                let decoded = decipher.update(biz_content, 'base64', 'utf8');
                                                decoded += decipher.final('utf8');
                                                biz_json = JSON.parse(decoded);
                                                break;
                                            }
                                        default:
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
                            error(ctx, error_code.API_CODE_WRONG_APPID);
                            return;
                        }

                        let [module, controller, action] = (method || '').split('.');

                        if (!module || !controller || !action) {
                            error(ctx, error_code.API_CODE_METHOD_PARAMETER_ERROR);
                            return;
                        }

                        ctx.module = module;
                        ctx.controller = controller;
                        ctx.action = action;

                        try {
                            let instance = getController(ctx, symbol);

                            if (!instance) {
                                error(ctx, error_code.API_CODE_METHOD_PARAMETER_ERROR);
                                return;
                            }

                            ctx.request.body = {};
                            ctx.request.body.post = biz_json;

                            instance.error_code = error_code;
                            instance.user = user;

                            let actions = instance[symbol] || {};

                            let promise = Promise.resolve();

                            if (instance.__before) {
                                promise = Promise.resolve(instance.__before());
                            }

                            return promise.then(function (data) {
                                if (data === false) {
                                    return false;
                                }
                                let act = actions[ctx.action];
                                if (act) {

                                    let param = ctx.param();


                                    if (act.value) {
                                        return act.value.call(instance, param, biz_json);
                                    } else if (act.initializer) {
                                        return act.initializer.call(instance)(param, biz_json);
                                    } else if (act.get) {
                                        return act.get().call(instance, param, biz_json);
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
                                if (ctx.status == 200) {} else if (ctx.status == 404) {
                                    error(ctx, error_code.API_CODE_METHOD_PARAMETER_ERROR);
                                } else {
                                    error(ctx, error_code.API_ERROR_500);
                                }
                            }).catch(function (e) {
                                console.error(e);
                                error(ctx, error_code.API_ERROR_500);
                            });
                        } catch (e) {
                            console.error(e);
                            if (helper.isEmpty(Controller)) {
                                error(ctx, error_code.API_CODE_METHOD_PARAMETER_ERROR);
                                return;
                            }
                        }
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

exports.default = invokeApi;

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