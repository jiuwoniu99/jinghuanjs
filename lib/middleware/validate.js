'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const getController = _safeRequire('../core/helper/getController');

const getProps = _safeRequire('../core/helper/getProps');

const isArray = _safeRequire('lodash/isArray');

const actionSymbol = PropValidate.name;

const defaultOptions = {};

function MidValidate(options, app) {

    options = Object.assign({}, defaultOptions, options);

    return (() => {
        var _ref = _asyncToGenerator(function* (ctx, next) {

            if (!ctx.module || !ctx.controller || !ctx.action) {
                return ctx.throw(404);
            }

            let instance = getProps(ctx, PropValidate, ctx.action);

            if (instance) {
                let { props } = instance;
                if (props && isArray(props.method)) {
                    props.method.map(function (method) {});
                }
            }

            yield next();
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
}

exports.default = MidValidate;

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