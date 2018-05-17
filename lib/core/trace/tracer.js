'use strict';

const fs = _safeRequire('fs');
const path = _safeRequire('path');

const stackTrace = _safeRequire('stack-trace');

const helper = _safeRequire('../helper');
const { htmlentities } = _safeRequire('./helper');

const readFileAsync = helper.promisify(fs.readFile);
const DEFAULT_404_TEMPLATE = path.join(__dirname, '../template/404.html');
const DEFAULT_500_TEMPLATE = path.join(__dirname, '../template/500.html');

module.exports = class Tracer {
    constructor(opts = {}) {
        this.ctxLineNumbers = opts.ctxLineNumbers || 10;
        this.debug = opts.debug !== undefined ? opts.debug : true;

        if (typeof opts.templates === 'string') {
            const templates = {};
            fs.readdirSync(opts.templates).forEach(file => {
                const match = file.match(/^(\d{3})\./);
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

    getTemplateContent() {
        if (!this.debug && !this.templates) {
            return Promise.resolve();
        }

        const readFilesAsync = Object.keys(this.templatesPath).map(status => readFileAsync(this.templatesPath[status], { encoding: 'utf-8' }).catch(() => readFileAsync(status !== '404' ? DEFAULT_500_TEMPLATE : DEFAULT_404_TEMPLATE, { encoding: 'utf-8' })).then(template => {
            this.templates[status] = template;
        }));
        return Promise.all(readFilesAsync);
    }

    getFile(line) {
        const filename = line.getFileName();
        const lineNumber = line.getLineNumber();

        return readFileAsync(filename, { encoding: 'utf-8' }).then(data => {
            let content = data.split('\n');
            const startLineNumber = Math.max(0, lineNumber - this.ctxLineNumbers);
            const endLineNumber = Math.min(lineNumber + this.ctxLineNumbers, data.length);
            content = content.slice(startLineNumber, endLineNumber);

            line.content = content.join('\n');
            line.startLineNumber = Math.max(0, startLineNumber) + 1;

            return line;
        }).catch(() => {});
    }

    renderError(template = this.templates[500], stacks, err) {
        let error;
        if (this.debug) {
            error = JSON.stringify(stacks, null, '\t');
        } else {
            error = '[]';
            err = '';
        }

        error = htmlentities(error);
        return template.replace('{{error}}', error).replace('{{errMsg}}', err.toString().replace(/[\r\n]+/g, '<br/>').replace(/\\/g, '\\\\').replace(/"/g, '\\"'));
    }

    renderNotFound(ctx, err) {
        if (!this.debug) {
            err = '';
        }

        return this.templates[404].replace('{{errMsg}}', htmlentities(err.toString()));
    }

    run(ctx, err) {
        this.ctx = ctx;
        ctx.type = helper.isFunction(this.contentType) ? this.contentType(ctx) : 'html';

        const isJson = helper.isFunction(ctx.response.is) && ctx.response.is('json');
        const isJsonp = helper.isFunction(ctx.isJsonp) && ctx.isJsonp();
        if (isJson || isJsonp) {
            if (!helper.isFunction(ctx.json)) {
                ctx.json = res => {
                    ctx.body = JSON.stringify(res);
                };
            }
            return (isJsonp ? ctx.jsonp : ctx.json).bind(ctx)({
                errno: ctx.status,
                errmsg: err.message
            });
        }

        if (ctx.status === 404) {
            ctx.body = this.renderNotFound(ctx, err);
            return true;
        }

        const stack = stackTrace.parse(err);
        return Promise.all(stack.map(this.getFile.bind(this))).then(stacks => stacks.filter(stack => stack)).then(stacks => {
            const template = this.templates[ctx.status];
            ctx.body = this.renderError(template, stack, err);
        });
    }
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