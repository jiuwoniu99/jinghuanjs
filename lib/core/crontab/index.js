"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _nodeSchedule = require("node-schedule");

var _nodeSchedule2 = _interopRequireDefault(_nodeSchedule);

var _helper = require("../helper");

var _helper2 = _interopRequireDefault(_helper);

var _mockHttp = require("../mock-http");

var _mockHttp2 = _interopRequireDefault(_mockHttp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const messenger = _safeRequire('../cluster').messenger;

const debug = _safeRequire('debug')('JH:core/crontab');

let Crontab = class Crontab {
    constructor(options, app) {
        this.options = this.parseOptions(options);
        this.app = app;
    }

    parseOptions(options) {
        if (_helper2.default.isString(options)) {
            options = [{
                handle: options,
                type: 'one'
            }];
        } else if (!_helper2.default.isArray(options)) {
            options = [options];
        }
        options = options.map(item => {
            item.type = item.type || 'one';
            if (!_helper2.default.isFunction(item.handle)) {
                const handle = item.handle;
                item.handle = () => (0, _mockHttp2.default)({ method: 'CLI', url: handle }, this.app);
            }
            return item;
        }).filter(item => {
            if (item.enable !== undefined) return !!item.enable;
            return true;
        });
        return options;
    }

    runItemTask(item) {
        if (item.type === 'all') {
            item.handle(this.app);
            debug(`run task ${item.taskName}, pid:${process.pid}`);
        } else {
            messenger.runInOne(() => {
                item.handle(this.app);
                debug(`run task ${item.taskName}, pid:${process.pid}`);
            });
        }
    }

    runTask() {
        this.options.forEach(item => {
            item.taskName = `${item.name ? ', name:' + item.name : ''}`;

            if (item.immediate) {
                this.app.on('appReady', () => {
                    this.runItemTask(item);
                });
            }
            if (item.interval) {
                const interval = _helper2.default.ms(item.interval);
                const timer = setInterval(() => {
                    this.runItemTask(item);
                }, interval);
                timer.unref();
                item.taskName += `interval: ${item.interval}`;
            } else if (item.cron) {
                _nodeSchedule2.default.scheduleJob(item.cron, () => {
                    this.runItemTask(item);
                });
                item.taskName += `, cron: ${item.cron}`;
            } else {
                throw new Error('.interval or .cron need be set');
            }
        });
    }
};
exports.default = Crontab;

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