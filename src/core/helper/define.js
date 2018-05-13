/**
 *
 * @param name
 * @param val
 */
export default function(name, val) {
    Object.defineProperty(jinghuan, name, {
        configurable: false,
        enumerable: true,
        writable: false,
        value: val
    });
}
