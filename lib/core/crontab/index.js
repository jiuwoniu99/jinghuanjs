'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//
var schedule = require('node-schedule');
//const _ = require('lodash');
//
var helper = require('../helper');
var messenger = require('../cluster').messenger;
var mockHttp = require('../mock-http');
//
var debug = require('debug')('JH:core/crontab');

/**
 * crontab class
 */

var Crontab = function () {
    /**
     * constructor
     * @param {Object|String} options
     * @param {Object} app koa app
     */
    function Crontab(options, app) {
        _classCallCheck(this, Crontab);

        this.options = this.parseOptions(options);
        this.app = app;
    }

    /**
     * parse options
     * @param {Object|String} options
     */


    Crontab.prototype.parseOptions = function parseOptions(options) {
        var _this = this;

        if (helper.isString(options)) {
            options = [{
                handle: options,
                type: 'one'
            }];
        } else if (!helper.isArray(options)) {
            options = [options];
        }
        options = options.map(function (item) {
            item.type = item.type || 'one';
            if (!helper.isFunction(item.handle)) {
                var handle = item.handle;
                item.handle = function () {
                    return mockHttp({ method: 'CLI', url: handle }, _this.app);
                };
            }
            return item;
        }).filter(function (item) {
            if (item.enable !== undefined) return !!item.enable;
            return true;
        });
        return options;
    };

    /**
     * run item task
     */


    Crontab.prototype.runItemTask = function runItemTask(item) {
        var _this2 = this;

        if (item.type === 'all') {
            item.handle(this.app);
            debug('run task ' + item.taskName + ', pid:' + process.pid);
        } else {
            messenger.runInOne(function () {
                item.handle(_this2.app);
                debug('run task ' + item.taskName + ', pid:' + process.pid);
            });
        }
    };

    /**
     * run task
     */


    Crontab.prototype.runTask = function runTask() {
        var _this3 = this;

        this.options.forEach(function (item) {
            item.taskName = '' + (item.name ? ', name:' + item.name : '');
            // immediate run task
            if (item.immediate) {
                _this3.app.on('appReady', function () {
                    _this3.runItemTask(item);
                });
            }
            if (item.interval) {
                var interval = helper.ms(item.interval);
                var timer = setInterval(function () {
                    _this3.runItemTask(item);
                }, interval);
                timer.unref();
                item.taskName += 'interval: ' + item.interval;
            } else if (item.cron) {
                schedule.scheduleJob(item.cron, function () {
                    _this3.runItemTask(item);
                });
                item.taskName += ', cron: ' + item.cron;
            } else {
                throw new Error('.interval or .cron need be set');
            }
        });
    };

    return Crontab;
}();

module.exports = Crontab;