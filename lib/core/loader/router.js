"use strict";

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _helper = require("../helper");

var _helper2 = _interopRequireDefault(_helper);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)(`JH:/core/loader/router[${process.pid}]`);

const RouterLoader = {
    load(appPath, modules) {
        if (modules.length) {
            const commonRouterFile = _path2.default.join(appPath, 'common/config/router.js');
            if (!_helper2.default.isFile(commonRouterFile)) {
                return [];
            }
            log(`load file: ${commonRouterFile}`);
            const commonRouter = _safeRequire(commonRouterFile);
            if (_helper2.default.isArray(commonRouter)) {
                return commonRouter;
            }

            for (const name in commonRouter) {
                const match = commonRouter[name].match;
                const moduleRouterFile = _path2.default.join(appPath, name, 'config/router.js');

                if (match) {
                    commonRouter[name].match = match;
                }
                if (!_helper2.default.isFile(moduleRouterFile)) {
                    commonRouter[name].rules = commonRouter[name].rules || [];
                    continue;
                }
                log(`load file: ${moduleRouterFile}`);
                const moduleRouter = _safeRequire(moduleRouterFile);
                (0, _assert2.default)(_helper2.default.isArray(moduleRouter), `${name}/config/router.js must be an array`);
                commonRouter[name].rules = moduleRouter;
            }
            return commonRouter;
        } else {
            const routerFile = _path2.default.join(appPath, 'config/router.js');
            if (!_helper2.default.isFile(routerFile)) {
                return [];
            }
            log(`load file: ${routerFile}`);
            const router = _safeRequire(routerFile);
            (0, _assert2.default)(_helper2.default.isArray(router), 'config/router must be an array');
            return router;
        }
    }
};

module.exports = RouterLoader;

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