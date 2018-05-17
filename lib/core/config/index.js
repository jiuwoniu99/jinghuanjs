'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _config = require('../loader/config');

var _config2 = _interopRequireDefault(_config);

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _set = require('lodash/set');

var _set2 = _interopRequireDefault(_set);

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LoaderConfig = new _config2.default();
const log = (0, _debug2.default)('JH:core/config');
const localCache = {};

let Config;

function configGet(name) {
  let config = (0, _merge2.default)({}, Config, localCache);
  return (0, _get2.default)(config, name);
}

function configSet(name, value) {
  return (0, _set2.default)(localCache, name, value);
}

function config() {
  if (jinghuan.mode === 'lib' && !_cluster2.default.isMaster) {
    Config = LoaderConfig.load(localCache);
  }

  return function (name, value) {
    if (!Config) {
      Config = LoaderConfig.load(localCache);
    }
    if (value === undefined) {
      return configGet(name);
    }
    return configSet(name, value);
  };
}

exports.default = config;