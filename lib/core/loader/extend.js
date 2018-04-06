'use strict';

var path = require('path');
var helper = require('../helper');
var assert = require('assert');
var util = require('./util.js');
var interopRequire = util.interopRequire;
var extendObj = util.extend;
var debug = require('debug')('JH:core/loader/extend[' + process.pid + ']');

var ExtendLoader = {

    allowExtends: ['jinghuan', 'application', 'context',
    // 'request',
    // 'response',
    'controller'],

    /**
     *
     * @param path
     * @param modules
     * @return {{}}
     */
    load: function load(extendPath, modules) {
        var allowExtends = ExtendLoader.allowExtends;
        var ret = {};

        function assign(type, ext) {
            if (!ret[type]) {
                ret[type] = {};
            }
            ret[type] = extendObj(ret[type], ext);
        }

        // system extend
        allowExtends.forEach(function (type) {
            var filepath = path.join(extendPath, 'extend/' + type + '.js');
            if (!helper.isFile(filepath)) {
                return;
            }
            debug('load file: ' + filepath);
            assign(type, interopRequire(filepath));
        });

        // application extend
        // allowExtends.forEach(type => {
        //     const filepath = path.join(jinghuan.ROOT_PATH, `common/extend/${type}.js`);
        //     if (!helper.isFile(filepath)) {
        //         return;
        //     }
        //     debug(`load file: ${filepath}`);
        //     assign(type, interopRequire(filepath));
        // });
        return ret;
    }
};

module.exports = ExtendLoader;