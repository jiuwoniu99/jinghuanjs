'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

const debug = _safeRequire('debug');

const loadConfig = _safeRequire('../loader/config');

const get = _safeRequire('lodash/get');

const set = _safeRequire('lodash/set');

const merge = _safeRequire('lodash/merge');

const cluster = _safeRequire('cluster');

const LoaderConfig = new loadConfig();
const log = debug('JH:core/config');
const localCache = {};

let Config;

function configGet(name) {
  let config = merge({}, Config, localCache);
  return get(config, name);
}

function configSet(name, value) {
  return set(localCache, name, value);
}

function config() {
  if (jinghuan.mode === 'lib' && !cluster.isMaster) {
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