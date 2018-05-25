import uuid from 'uuid';

const symbol = Symbol(uuid.v4());

/**
 *
 * @param props
 * @return {Function}
 */
function PropsSocket(props) {
    return function (target, name, descriptor) {
        let {initializer, value} = descriptor;
        
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
                props,
                target,
                descriptor,
                name
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

export default PropsSocket;
