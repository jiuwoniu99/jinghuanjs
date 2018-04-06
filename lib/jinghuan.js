'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Koa = require('koa');
var bluebird = require('bluebird');
var assert = require('assert');
var log4js = require('log4js');
//const _ =require("lodash");
//
var pkg = require('../package.json');
var helper = require('./core/helper');
var messenger = require('./core/cluster').messenger;
var events = require('./core/events');

/**
 * use bluebird instead of default Promise
 */
global.Promise = bluebird;

/**
 * global jinghuan object
 * @type {Object}
 */
global.jinghuan = Object.create(helper);

/**
 * Koa application instance
 * @type {Koa}
 */
jinghuan.app = new Koa();

/**
 * add jinghuan to jinghuan.app
 */
// jinghuan.app.jinghuan = jinghuan;

/**
 * version
 */
jinghuan.version = pkg.version;

/**
 * messenger
 * @type {Object}
 */
jinghuan.messenger = messenger;

/**
 * base controller class
 */
jinghuan.Controller = function () {
  function _class(ctx) {
    _classCallCheck(this, _class);

    this.ctx = ctx;
  }

  return _class;
}();

/**
 * base logic class
 */
//jinghuan.Logic = class Logic extends jinghuan.Controller {
//};

/**
 * service base class
 */
//jinghuan.Service = class Service {
//};

/**
 * get service
 */
//jinghuan.service = (name, m, ...args) => {
//	let mcls = jinghuan.app.services;
//	if (jinghuan.app.modules.length) {
//		mcls = jinghuan.app.services[m || 'common'] || {};
//	} else {
//		args.unshift(m);
//	}
//	const Cls = mcls[name];
//	assert(Cls, `can not find service: ${name}`);
//	if (helper.isFunction(Cls)) return new Cls(...args);
//	return Cls;
//};

// before start server
var promises = [];

jinghuan.beforeStartServer = function (fn) {
  if (fn) {
    assert(helper.isFunction(fn), 'fn in jinghuan.beforeStartServer must be a function');
    return promises.push(fn());
  }
  var promise = Promise.all(promises);
  var timeout = helper.ms(jinghuan.config('startServerTimeout'));
  var timeoutPromise = helper.timeout(timeout).then(function () {
    var err = new Error('waiting for start server timeout, time: ' + timeout + 'ms');
    return Promise.reject(err);
  });
  return Promise.race([promise, timeoutPromise]);
};

log4js.configure({
  appenders: {
    console: { type: 'console', layout: { type: 'pattern', pattern: '%[[%d] [%z] [%p]%] - %m' } }
  },
  categories: {
    default: { appenders: ['console'], level: 'all' }
  }
});
jinghuan.logger = log4js.getLogger();

jinghuan.events = new events();