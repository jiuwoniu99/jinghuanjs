import isString from 'lodash/isString';

/**
 *
 * @param obj
 * @param safe
 * @return {*}
 */
export default function (obj, safe = true) {
    if (isString(obj)) {
        if (safe) {
            try {
                obj = require(obj);
            } catch (e) {
                console.error(e);
                obj = null;
            }
        } else {
            obj = require(obj);
        }
    }
    return obj && obj.__esModule ? obj.default : obj;
};
