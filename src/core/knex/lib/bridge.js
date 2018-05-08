import debug from 'debug';

let bridge = {}

/**
 *
 * @param expr
 * @param str
 * @returns {Array}
 */
bridge.preg_split = function (expr, str) {
    try {
        let s = str.split(eval(expr));
        let r = [];
        for (var v of s) {
            if (v) {
                r.push(v);
            }
        }
        return r;
    } catch (ex) {
        console.log(ex);
    }
}


export default bridge
