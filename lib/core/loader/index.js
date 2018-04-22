'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var helper = require('../helper');
var path = require('path');
var fs = require('fs');
var Config = require('./config.js');
var bootstrap = require('./bootstrap.js');
var Middleware = require('./middleware.js');
var router = require('./router.js');
var extend = require('./extend.js');
var common = require('./common.js');
var crontab = require('./crontab.js');
var extendMethod = require('./util.js').extend;
var validator = require('./validator.js');
var events = require('./events.js');
var sql = require('./sql.js');

/**
 * Loader
 */

var Loader = function () {
  /**
   * constructor
   */
  function Loader() {
    _classCallCheck(this, Loader);
  }

  /**
   * 加载项目的配置文件
   */


  Loader.prototype.loadConfig = function loadConfig(env) {
    return new Config().load();
  };

  /**
   * 加载引导程序
   */


  Loader.prototype.loadBootstrap = function loadBootstrap(type) {
    return bootstrap(jinghuan.APP_PATH, jinghuan.app.modules, type);
  };

  /**
   * 加载控制器
   */


  Loader.prototype.loadController = function loadController() {
    return common.load(jinghuan.APP_PATH, 'controller', jinghuan.app.modules);
  };

  /**
   * load logic
   */


  Loader.prototype.loadLogic = function loadLogic() {
    return common.load(jinghuan.APP_PATH, 'logic', jinghuan.app.modules);
  };

  /**
   * load model
   */


  Loader.prototype.loadModel = function loadModel() {
    return common.load(jinghuan.APP_PATH, 'model', jinghuan.app.modules);
  };

  /**
   * load service
   */


  Loader.prototype.loadService = function loadService() {
    return common.load(jinghuan.APP_PATH, 'service', jinghuan.app.modules);
  };

  /**
   * 加载中间件
   */


  Loader.prototype.loadMiddleware = function loadMiddleware(app) {
    return new Middleware().load(jinghuan.APP_PATH, jinghuan.JH_PATH, jinghuan.app.modules, app);
  };

  /**
   * load router
   */


  Loader.prototype.loadRouter = function loadRouter() {
    return router.load(jinghuan.APP_PATH, jinghuan.app.modules);
  };

  /**
   * load extend
   */


  Loader.prototype.loadExtend = function loadExtend(path) {
    return extend.load(path, jinghuan.app.modules);
  };

  /**
   * load crontab
   */


  Loader.prototype.loadCrontab = function loadCrontab() {
    return crontab(jinghuan.APP_PATH, jinghuan.app.modules);
  };

  /**
   * load use defined file
   */


  Loader.prototype.loadCommon = function loadCommon(name) {
    return common.load(jinghuan.APP_PATH, name, jinghuan.app.modules);
  };

  /**
   * load validator
   */


  Loader.prototype.loadValidator = function loadValidator() {
    return validator(jinghuan.APP_PATH, jinghuan.app.modules);
  };

  /**
   * load events
   * @return {*}
   */


  Loader.prototype.loadEvents = function loadEvents() {
    return events();
  };

  /**
   *
   * @return {{}}
   */


  Loader.prototype.loadSql = function loadSql() {
    return sql(jinghuan.APP_PATH, jinghuan.app.modules);
  };

  return Loader;
}();

Loader.extend = extendMethod;

module.exports = Loader;