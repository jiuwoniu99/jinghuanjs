'use strict';

const bluebird = _safeRequire('bluebird');

const log4js = _safeRequire('log4js');

const jwt = _safeRequire('jsonwebtoken');

const pkg = _safeRequire('../package.json');

const helper = _safeRequire('./core/helper');

const c = _safeRequire('./core/cluster');

const events = _safeRequire('./core/events');

const define = _safeRequire('./core/helper/define');

const valid = _safeRequire('./core/vlaid');

global.Promise = bluebird;

define('jinghuan', Object.create(helper), global);
define('version', pkg.version);
define('messenger', c.messenger);
define('valid', new valid());
define('Controller', class Controller {});

let pattern = '%d{yyyy-MM-dd hh:mm:ss} [%6z] [%5.5p] - %m';

log4js.configure({
  appenders: {
    console: {
      type: 'console',
      layout: { type: 'pattern', pattern }
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'all' }
  }
});

define('logger', log4js.getLogger());
define('events', new events());
define('jwt', jwt);

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