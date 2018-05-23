'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const uuid = _safeRequire('uuid');

const symbol = Symbol(uuid.v4());

function PropsSocket(props) {
    return function (target, name, descriptor) {
        let { initializer, value } = descriptor;

        if (!target[symbol]) {
            Object.defineProperty(target, symbol, {
                configurable: false,
                enumerable: false,
                writable: false,
                value: {}
            });
        }

        Object.defineProperty(target[symbol], props.name, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: {
                initializer,
                value,
                props
            }
        });
    };
};

Object.defineProperty(PropsSocket, 'name', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: symbol
});

exports.default = PropsSocket;

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