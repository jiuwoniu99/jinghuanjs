/**
 *
 * @param name
 * @param val
 */
export default function (name, val, target = jinghuan) {
    Object.defineProperty(target, name, {
        configurable: false,
        enumerable: true,
        writable: false,
        value: val
    });
}
