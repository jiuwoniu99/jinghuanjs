'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
//
var assert = require('assert');
var debug = require('debug')('JH:core/session/file[' + process.pid + ']');
var gc = require('../gc');
//const _ = require('lodash');
//
var helper = require('../helper');
var FileStore = require('../cache/file');
//
var readFile = helper.promisify(fs.readFile, fs);
var unlink = helper.promisify(fs.unlink, fs);
var initSessionData = Symbol('jinghuan-session-file-init');

/**
 * use file to store session
 */

var FileSession = function () {
    /**
     * constructor
     * @param {Object} options
     * @param {Object} ctx
     */
    function FileSession(options, ctx) {
        var _this = this;

        _classCallCheck(this, FileSession);

        assert(options.sessionPath && path.isAbsolute(options.sessionPath), '.sessionPath required');
        assert(options.cookie, '.cookie required');

        this.options = options;
        this.ctx = ctx;
        this.fileStore = new FileStore(options.sessionPath);
        this.data = {};
        this.status = 0;

        this.gcType = 'session_' + options.sessionPath;
        gc(this, this.options.gcInterval);

        // flush session when request finish
        this.ctx.res.once('finish', function () {
            _this.flush();
        });
    }

    /**
     * init session data
     */


    FileSession.prototype[initSessionData] = function () {
        var _this2 = this;

        if (this.initPromise) {
            return this.initPromise;
        }
        if (this.options.fresh || this.status === -1) {
            this.initPromise = Promise.resolve();
            return this.initPromise;
        }
        this.initPromise = this.fileStore.get(this.options.cookie).then(function (content) {
            content = JSON.parse(content);
            if (helper.isEmpty(content)) return;
            // session data is expired
            if (content.expires < Date.now()) {
                return _this2.delete();
            }
            _this2.data = content.data || {};
        }).catch(function (err) {
            return debug(err);
        });
        return this.initPromise;
    };

    /**
     * get session data
     * @param {String} name
     */


    FileSession.prototype.get = function get(name) {
        var _this3 = this;

        return this[initSessionData]().then(function () {
            if (_this3.options.autoUpdate) {
                _this3.status = 1;
            }
            return name ? _this3.data[name] : _this3.data;
        });
    };

    /**
     * set session data
     * @param {String} name
     * @param {Mixed} value
     */


    FileSession.prototype.set = function set(name, value) {
        var _this4 = this;

        return this[initSessionData]().then(function () {
            _this4.status = 1;
            if (value === null) {
                delete _this4.data[name];
            } else {
                _this4.data[name] = value;
            }
        });
    };

    /**
     * delete session data
     */


    FileSession.prototype.delete = function _delete() {
        this.status = -1;
        this.data = {};
        return Promise.resolve();
    };

    /**
     * flush session data to store
     */


    FileSession.prototype.flush = function flush() {
        if (this.status === -1) {
            this.status = 0;
            return this.fileStore.delete(this.options.cookie);
        } else if (this.status === 1) {
            this.status = 0;
            return this.fileStore.set(this.options.cookie, JSON.stringify({
                expires: Date.now() + helper.ms(this.options.maxAge || 0),
                data: this.data
            }));
        }
        return Promise.resolve();
    };

    /**
     * gc
     */


    FileSession.prototype.gc = function gc() {
        var _this5 = this;

        var files = helper.getdirFiles(this.options.sessionPath);
        files.forEach(function (file) {
            var filePath = path.join(_this5.options.sessionPath, file);
            readFile(filePath, 'utf8').then(function (content) {
                if (!content) return Promise.reject(new Error('content empty'));
                content = JSON.parse(content);
                if (Date.now() > content.expires) {
                    return Promise.reject(new Error('session file expired'));
                }
            }).catch(function () {
                return unlink(filePath);
            });
        });
    };

    return FileSession;
}();

module.exports = FileSession;