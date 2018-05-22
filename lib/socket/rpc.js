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

function socketRpc(options, app) {
    return (() => {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            let pathname = ctx.path || '';
            let rpcpathname = options.path || '/rpc';

            if (pathname === rpcpathname) {
                ctx.websocket.on('message', function (message) {
                    console.log(message);
                });
            } else {
                yield next();
            }
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
};

exports.default = socketRpc;

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