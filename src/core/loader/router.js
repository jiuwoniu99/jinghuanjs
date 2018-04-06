//
const path = require('path');
const assert = require('assert');
const debug = require('debug')(`JH:/core/loader/router[${process.pid}]`);
//const _ = require('lodash');
//
const interopRequire = require('./util.js').interopRequire;
const helper = require('../helper');
const RouterLoader = {

    /**
     * route loader
     */
    load(appPath, modules) {
        if (modules.length) {
            const commonRouterFile = path.join(appPath, 'common/config/router.js');
            if (!helper.isFile(commonRouterFile)) {
                return [];
            }
            debug(`load file: ${commonRouterFile}`);
            const commonRouter = interopRequire(commonRouterFile);
            if (helper.isArray(commonRouter)) {
                return commonRouter;
            }

            /**
             *
             */
            for (const name in commonRouter) {
                const match = commonRouter[name].match;
                const moduleRouterFile = path.join(appPath, name, 'config/router.js');
                // match is not required
                if (match) {
                    commonRouter[name].match = match;
                }
                if (!helper.isFile(moduleRouterFile)) {
                    commonRouter[name].rules = commonRouter[name].rules || [];
                    continue;
                }
                debug(`load file: ${moduleRouterFile}`);
                const moduleRouter = interopRequire(moduleRouterFile);
                assert(helper.isArray(moduleRouter), `${name}/config/router.js must be an array`);
                commonRouter[name].rules = moduleRouter;
            }
            return commonRouter;
        } else {
            const routerFile = path.join(appPath, 'config/router.js');
            if (!helper.isFile(routerFile)) {
                return [];
            }
            debug(`load file: ${routerFile}`);
            const router = interopRequire(routerFile);
            assert(helper.isArray(router), 'config/router must be an array');
            return router;
        }
    }
};

module.exports = RouterLoader;
