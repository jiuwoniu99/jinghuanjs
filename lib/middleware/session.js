"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _session = require("../core/session");

var _session2 = _interopRequireDefault(_session);

var _onFinished = require("on-finished");

var _onFinished2 = _interopRequireDefault(_onFinished);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function invokeSession(options, app) {
    return (() => {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            let Session = new _session2.default(ctx);
            try {
                Object.defineProperty(ctx, 'session', {
                    get() {
                        return Session.run;
                    }
                });
                yield next();
            } catch (ex) {} finally {
                yield Session.finish();
            }
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
};

exports.default = invokeSession;