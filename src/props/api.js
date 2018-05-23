import uuid from 'uuid';

const symbol = Symbol(uuid.v4());

/**
 *
 * @param props
 * @return {Function}
 */
function PropsApi(props) {
    return function (target, name, descriptor) {
        let {initializer, value, get, set} = descriptor;
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
                props,
                get,
                set
            }
        });
    };
};

Object.defineProperty(PropsApi, 'name', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: symbol
});

export default PropsApi;
