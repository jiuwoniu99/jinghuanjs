'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _config = require('./config.js');

var _config2 = _interopRequireDefault(_config);

var _bootstrap = require('./bootstrap.js');

var _bootstrap2 = _interopRequireDefault(_bootstrap);

var _middleware = require('./middleware.js');

var _middleware2 = _interopRequireDefault(_middleware);

var _extend = require('./extend.js');

var _extend2 = _interopRequireDefault(_extend);

var _common = require('./common.js');

var _common2 = _interopRequireDefault(_common);

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

var _events = require('./events.js');

var _events2 = _interopRequireDefault(_events);

var _sql = require('./sql.js');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Loader = class Loader {
  constructor() {}

  loadConfig() {
    return new _config2.default().load();
  }

  loadBootstrap(type) {
    return (0, _bootstrap2.default)(jinghuan.APP_PATH, jinghuan.modules, type);
  }

  loadController() {
    return _common2.default.load(jinghuan.APP_PATH, 'controller', jinghuan.modules);
  }

  loadMiddleware() {
    return new _middleware2.default().load();
  }

  loadExtend(path) {
    return _extend2.default.load(path, jinghuan.modules);
  }

  loadEvents() {
    return (0, _events2.default)();
  }

  loadSql() {
    return (0, _sql2.default)(jinghuan.APP_PATH, jinghuan.modules);
  }
};


Loader.extend = _util2.default.extend;

exports.default = Loader;