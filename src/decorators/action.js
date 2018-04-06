module.exports = function(props) {
    return function(target, name, descriptor) {
        let {initializer, value} = descriptor;
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
                initializer,
                value,
                props
            }
        });
    };
};

const symbol = Symbol('action');
Object.defineProperty(module.exports, 'name', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: symbol
});
