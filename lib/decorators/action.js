'use strict';

module.exports = function (props) {
    return function (target, name, descriptor) {
        var initializer = descriptor.initializer,
            value = descriptor.value;
        // console.log(target, name, descriptor);

        if (!target[symbol]) {
            Object.defineProperty(target, symbol, {
                configurable: false,
                enumerable: false,
                writable: false,
                value: {}
            });
        }

        Object.defineProperty(target[symbol], name, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: {
                initializer: initializer,
                value: value,
                props: props
            }
        });
    };
};

var symbol = Symbol('action');
Object.defineProperty(module.exports, 'name', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: symbol
});