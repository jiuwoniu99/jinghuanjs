'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = load;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = _safeRequire('path');

const each = _safeRequire('lodash/each');

const loadFiles = _safeRequire('../helper/loadFiles');

const events = {};

function load() {
    let { APP_PATH, modules } = jinghuan;

    each(modules, module => {
        let files = loadFiles(path.join(APP_PATH, module, 'events'), 'js');
        each(files, (file, name) => {
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

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}