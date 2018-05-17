'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function invokeCross(options, app) {
    return (() => {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            let { origin } = ctx.header;
            let AccessControlRequestHeaders = ctx.header['access-control-request-headers'];
            let AccessControlRequestMethod = ctx.header['access-control-request-method'];

            if (origin) {

                let headers = {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Credentials': 'true'
                };

                if (AccessControlRequestHeaders) {
                    headers['Access-Control-Allow-Headers'] = AccessControlRequestHeaders;
                }
                if (AccessControlRequestMethod) {
                    headers['Access-Control-Allow-Method'] = AccessControlRequestMethod;
                }

                ctx.set(headers);

                if (ctx.isMethod('options')) {
                    ctx.body = '';
                } else {
                    yield next();
                }
            } else {
                yield next();
            }
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
}

exports.default = invokeCross;