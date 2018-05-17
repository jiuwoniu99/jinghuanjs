'use strict';

const text = _safeRequire('./text.js');
const helper = _safeRequire('../helper');
const parseString = _safeRequire('xml2js').parseString;
const parser = helper.promisify(parseString, parseString);

module.exports = (ctx, opts) => text(ctx, opts).then(parser).then(data => ({ post: data }));

function _safeRequire(obj) {
  if (typeof obj === 'string') {
    try {
      obj = require(obj);
    } catch (e) {
      console.error(e);
      obj = null;
    }
  }

  return obj && obj.__esModule ? obj.default : obj;
}