'use strict';

const action = _safeRequire('./action');

const api = _safeRequire('./api');

const rest = _safeRequire('./rest');

const rpc = _safeRequire('./rpc');

const socket = _safeRequire('./socket');

const validate = _safeRequire('./validate');

const define = _safeRequire('../core/helper/define');

define('props', { action, api, rest, rpc, socket, validate });
define('PropAction', action, global);
define('PropApi', api, global);
define('PropRest', rest, global);
define('PropRpc', rpc, global);
define('PropSocket', socket, global);
define('PropValidate', validate, global);

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