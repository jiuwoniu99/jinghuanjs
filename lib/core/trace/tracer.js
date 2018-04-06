'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
//const _ = require('lodash');
var stackTrace = require('stack-trace');
//
var helper = require('../helper');

var _require = require('./helper'),
    htmlentities = _require.htmlentities;
//


var readFileAsync = helper.promisify(fs.readFile);
var DEFAULT_404_TEMPLATE = path.join(__dirname, '../template/404.html');
var DEFAULT_500_TEMPLATE = path.join(__dirname, '../template/500.html');

module.exports = function () {
    function Tracer() {
        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Tracer);

        this.ctxLineNumbers = opts.ctxLineNumbers || 10;
        this.debug = opts.debug !== undefined ? opts.debug : true;

        if (typeof opts.templates === 'string') {
            var templates = {};
            fs.readdirSync(opts.templates).forEach(function (file) {
                var match = file.match(/^(\d{3})\./);
                if (Array.isArray(match)) {
                    templates[match[1]] = path.join(opts.templates, file);
                }
            });
            opts.templates = templates;
        }

        this.contentType = opts.contentType;
        this.templatesPath = helper.extend({
            404: DEFAULT_404_TEMPLATE,
            500: DEFAULT_500_TEMPLATE
        }, opts.templates);
        this.templates = {};
    }

    /**
     * get error template file content
     */


    Tracer.prototype.getTemplateContent = function getTemplateContent() {
        var _this = this;

        if (!this.debug && !this.templates) {
            return Promise.resolve();
        }

        var readFilesAsync = Object.keys(this.templatesPath).map(function (status) {
            return readFileAsync(_this.templatesPath[status], { encoding: 'utf-8' }).catch(function () {
                return readFileAsync(status !== '404' ? DEFAULT_500_TEMPLATE : DEFAULT_404_TEMPLATE, { encoding: 'utf-8' });
            }).then(function (template) {
                _this.templates[status] = template;
            });
        });
        return Promise.all(readFilesAsync);
    };

    /**
     * get File content by stack path and lineNumber
     * @param {*object} line stack object for every stack
     */


    Tracer.prototype.getFile = function getFile(line) {
        var _this2 = this;

        var filename = line.getFileName();
        var lineNumber = line.getLineNumber();

        return readFileAsync(filename, { encoding: 'utf-8' }).then(function (data) {
            var content = data.split('\n');
            var startLineNumber = Math.max(0, lineNumber - _this2.ctxLineNumbers);
            var endLineNumber = Math.min(lineNumber + _this2.ctxLineNumbers, data.length);
            content = content.slice(startLineNumber, endLineNumber);

            line.content = content.join('\n');
            line.startLineNumber = Math.max(0, startLineNumber) + 1;

            return line;
        }).catch(function () {});
    };

    /**
     * render error page
     * @param {*Array} stacks stacke tracer array
     */


    Tracer.prototype.renderError = function renderError() {
        var template = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.templates[500];
        var stacks = arguments[1];
        var err = arguments[2];

        var error = void 0;
        if (this.debug) {
            error = JSON.stringify(stacks, null, '\t');
        } else {
            error = '[]';
            err = '';
        }

        error = htmlentities(error);
        return template.replace('{{error}}', error).replace('{{errMsg}}', err.toString().replace(/[\r\n]+/g, '<br/>').replace(/\\/g, '\\\\').replace(/"/g, '\\"'));
    };

    /**
     * render 404 not found page
     * @param {*Error} err Error instance
     */


    Tracer.prototype.renderNotFound = function renderNotFound(ctx, err) {
        if (!this.debug) {
            err = '';
        }

        return this.templates[404].replace('{{errMsg}}', htmlentities(err.toString()));
    };

    /**
     * @param {*object} ctx koa ctx object
     * @param {*Error} err Error instance
     */


    Tracer.prototype.run = function run(ctx, err) {
        var _this3 = this;

        this.ctx = ctx;
        ctx.type = helper.isFunction(this.contentType) ? this.contentType(ctx) : 'html';

        var isJson = helper.isFunction(ctx.response.is) && ctx.response.is('json');
        var isJsonp = helper.isFunction(ctx.isJsonp) && ctx.isJsonp();
        if (isJson || isJsonp) {
            if (!helper.isFunction(ctx.json)) {
                ctx.json = function (res) {
                    ctx.body = JSON.stringify(res);
                };
            }
            return (isJsonp ? ctx.jsonp : ctx.json).bind(ctx)({
                errno: ctx.status,
                errmsg: err.message
            });
        }

        // 404 not found error
        if (ctx.status === 404) {
            ctx.body = this.renderNotFound(ctx, err);
            return true;
        }

        var stack = stackTrace.parse(err);
        return Promise.all(stack.map(this.getFile.bind(this))).then(function (stacks) {
            return stacks.filter(function (stack) {
                return stack;
            });
        }).then(function (stacks) {
            var template = _this3.templates[ctx.status];
            ctx.body = _this3.renderError(template, stack, err);
        });
    };

    return Tracer;
}();