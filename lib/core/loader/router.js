'use strict';

//
var path = require('path');
var assert = require('assert');
var debug = require('debug')('JH:/core/loader/router[' + process.pid + ']');
//const _ = require('lodash');
//
var interopRequire = require('./util.js').interopRequire;
var helper = require('../helper');
var RouterLoader = {

    /**
     * route loader
     */
    load: function load(appPath, modules) {
        if (modules.length) {
            var commonRouterFile = path.join(appPath, 'common/config/router.js');
            if (!helper.isFile(commonRouterFile)) {
                return [];
            }
            debug('load file: ' + commonRouterFile);
            var commonRouter = interopRequire(commonRouterFile);
            if (helper.isArray(commonRouter)) {
                return commonRouter;
            }

            /**
             *
             */
            for (var name in commonRouter) {
                var match = commonRouter[name].match;
                var moduleRouterFile = path.join(appPath, name, 'config/router.js');
                // match is not required
                if (match) {
                    commonRouter[name].match = match;
                }
                if (!helper.isFile(moduleRouterFile)) {
                    commonRouter[name].rules = commonRouter[name].rules || [];
                    continue;
                }
                debug('load file: ' + moduleRouterFile);
                var moduleRouter = interopRequire(moduleRouterFile);
                assert(helper.isArray(moduleRouter), name + '/config/router.js must be an array');
                commonRouter[name].rules = moduleRouter;
            }
            return commonRouter;
        } else {
            var routerFile = path.join(appPath, 'config/router.js');
            if (!helper.isFile(routerFile)) {
                return [];
            }
            debug('load file: ' + routerFile);
            var router = interopRequire(routerFile);
            assert(helper.isArray(router), 'config/router must be an array');
            return router;
        }
    }
};

module.exports = RouterLoader;