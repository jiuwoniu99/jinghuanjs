'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = load;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _each = require('lodash/each');

var _each2 = _interopRequireDefault(_each);

var _loadFiles = require('../helper/loadFiles');

var _loadFiles2 = _interopRequireDefault(_loadFiles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const events = {};

function load() {
    let { APP_PATH, modules } = jinghuan;

    (0, _each2.default)(modules, module => {
        let files = (0, _loadFiles2.default)(_path2.default.join(APP_PATH, module, 'events'), 'js');
        (0, _each2.default)(files, (file, name) => {
            let event = _safeRequire(file);
            events[name] = events[name] || {};
            events[name][event.index] = event.handle;

            if (!jinghuan.events.isEvent(name)) {
                jinghuan.events.on(name, (() => {
                    var _ref = _asyncToGenerator(function* (...args) {
                        for (let i in events[name]) {
                            yield events[name][i](...args);
                        }
                    });

                    return function () {
                        return _ref.apply(this, arguments);
                    };
                })());
            }
        });
    });
    return events;
};

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