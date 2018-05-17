'use strict';

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _log4js = require('log4js');

var _log4js2 = _interopRequireDefault(_log4js);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _helper = require('./core/helper');

var _helper2 = _interopRequireDefault(_helper);

var _cluster = require('./core/cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _events = require('./core/events');

var _events2 = _interopRequireDefault(_events);

var _pm = require('./core/pm2');

var _pm2 = _interopRequireDefault(_pm);

var _define = require('./core/helper/define');

var _define2 = _interopRequireDefault(_define);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let jinghuan = Object.create(_helper2.default);

let app = new _koa2.default();

global.Promise = _bluebird2.default;

global.jinghuan = jinghuan;

(0, _define2.default)('app', app);

Object.defineProperty(app, 'jinghuan', {
    get() {
        return jinghuan;
    }
});
(0, _define2.default)('version', _package2.default.version);
(0, _define2.default)('messenger', _cluster2.default.messenger);

let Controller = class Controller {};
;

(0, _define2.default)('Controller', Controller);

const promises = [];

let pattern = '';

if (_pm2.default.inPM2) {
    pattern = '%d{yyyy-MM-dd hh:mm:ss} [%6z] [%5.5p] - %m';
} else {
    pattern = '%[%d{yyyy-MM-dd hh:mm:ss} [%6z] [%5.5p] %] - %m';
}

_log4js2.default.configure({
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

(0, _define2.default)('logger', _log4js2.default.getLogger());
(0, _define2.default)('events', new _events2.default());
(0, _define2.default)('jwt', _jsonwebtoken2.default);