'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const text = _safeRequire('./text.js');

const helper = _safeRequire('../helper');

const {
    parseString
} = _safeRequire('xml2js');

const parser = helper.promisify(parseString, parseString);

exports.default = (ctx, opts) => text(ctx, opts).then(parser).then(data => ({ post: data }));

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