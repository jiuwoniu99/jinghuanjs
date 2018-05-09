import path from "path"
import assert from "assert"
import helper from "../helper";
import debug from 'debug';

const log = debug(`JH:/core/loader/router[${process.pid}]`);


/**
 *
 * @type {{load(*=, *): *}}
 */
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
            log(`load file: ${commonRouterFile}`);
            const commonRouter = require(commonRouterFile);
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
                log(`load file: ${moduleRouterFile}`);
                const moduleRouter = require(moduleRouterFile);
                assert(helper.isArray(moduleRouter), `${name}/config/router.js must be an array`);
                commonRouter[name].rules = moduleRouter;
            }
            return commonRouter;
        } else {
            const routerFile = path.join(appPath, 'config/router.js');
            if (!helper.isFile(routerFile)) {
                return [];
            }
            log(`load file: ${routerFile}`);
            const router = require(routerFile);
            assert(helper.isArray(router), 'config/router must be an array');
            return router;
        }
    }
};

module.exports = RouterLoader;
