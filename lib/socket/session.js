"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const session = _safeRequire("../core/session");

const onFinished = _safeRequire("on-finished");

function SocketSession(options, app) {
    return (() => {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            if (ctx.websocket && !ctx.websocket.session) {
                ctx.websocket.session = new session(ctx);
            }
            try {
                Object.defineProperty(ctx, 'session', {
                    get() {
                        return ctx.websocket.session.run;
                    }
                });
                yield next();
            } catch (ex) {} finally {}
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
};

exports.default = SocketSession;

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