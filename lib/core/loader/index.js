'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

const Config = _safeRequire('./config.js');

const bootstrap = _safeRequire('./bootstrap.js');

const Middleware = _safeRequire('./middleware.js');

const extend = _safeRequire('./extend.js');

const common = _safeRequire('./common.js');

const util = _safeRequire('./util');

const events = _safeRequire('./events.js');

const sql = _safeRequire('./sql.js');

let Loader = class Loader {
  constructor() {}

  loadConfig() {
    return new Config().load();
  }

  loadBootstrap(type) {
    return bootstrap(jinghuan.APP_PATH, jinghuan.modules, type);
  }

  loadController() {
    return common.load(jinghuan.APP_PATH, 'controller', jinghuan.modules);
  }

  loadMiddleware() {
    return new Middleware().load();
  }

  loadExtend(path) {
    return extend.load(path, jinghuan.modules);
  }

  loadEvents() {
    return events();
  }

  loadSql() {
    return sql(jinghuan.APP_PATH, jinghuan.modules);
  }
};


Loader.extend = util.extend;

exports.default = Loader;

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