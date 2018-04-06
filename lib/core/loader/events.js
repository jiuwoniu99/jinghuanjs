'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var path = require('path');
var interopRequire = require('./util.js').interopRequire;
var debug = require('debug')('JH:core/loader/events[' + process.pid + ']');
var helper = require('../helper');
//const _ = require('lodash');
var each = require('lodash/each');

/**
 *
 * @param dir
 * @return {{}}
 */
var loadFiles = function loadFiles(dir) {
    return helper.getdirFiles(dir).filter(function (file) {
        return (/\.js/.test(file)
        );
    });
};

var events = {};
/**
 *
 * @return {{}}
 */
module.exports = function load() {
    var _this = this;

    var _jinghuan = jinghuan,
        APP_PATH = _jinghuan.APP_PATH;
    var modules = jinghuan.app.modules;


    each(modules, function (val, name) {
        var files = loadFiles(path.join(APP_PATH, val, 'events'));
        each(files, function (file) {
            //console.log(file);
            var event = interopRequire(path.join(APP_PATH, val, 'events', file), true);
            var index = event[0],
                callback = event[1];

            var name = file.replace(/\\/g, '/').replace(/\.js/, '');

            events[name] = events[name] || {};
            events[name][index] = callback;
            //console.log(callback)
            if (!jinghuan.events.isEvent(name)) {
                jinghuan.events.on(name, function () {
                    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                        var i,
                            _events$name,
                            _args = arguments;

                        return _regenerator2.default.wrap(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        _context.t0 = _regenerator2.default.keys(events[name]);

                                    case 1:
                                        if ((_context.t1 = _context.t0()).done) {
                                            _context.next = 7;
                                            break;
                                        }

                                        i = _context.t1.value;
                                        _context.next = 5;
                                        return (_events$name = events[name])[i].apply(_events$name, _args);

                                    case 5:
                                        _context.next = 1;
                                        break;

                                    case 7:
                                    case 'end':
                                        return _context.stop();
                                }
                            }
                        }, _callee, _this);
                    }));

                    return function () {
                        return _ref.apply(this, arguments);
                    };
                }());
            }
        });
    });
    return {};
};