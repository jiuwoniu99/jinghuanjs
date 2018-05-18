'use strict';

const fs = _safeRequire('fs');
const path = _safeRequire('path');

const assert = _safeRequire('assert');
const debug = _safeRequire('debug')(`JH:core/session/file[${process.pid}]`);
const gc = _safeRequire('../gc');

const helper = _safeRequire('../helper');
const FileStore = _safeRequire('../cache/file');

const readFile = helper.promisify(fs.readFile, fs);
const unlink = helper.promisify(fs.unlink, fs);
const initSessionData = Symbol('jinghuan-session-file-init');

let FileSession = class FileSession {
    constructor(options, ctx) {
        assert(options.sessionPath && path.isAbsolute(options.sessionPath), '.sessionPath required');
        assert(options.cookie, '.cookie required');

        this.options = options;
        this.ctx = ctx;
        this.fileStore = new FileStore(options.sessionPath);
        this.data = {};
        this.status = 0;

        this.gcType = `session_${options.sessionPath}`;
        gc(this, this.options.gcInterval);

        this.ctx.res.once('finish', () => {
            this.flush();
        });
    }

    [initSessionData]() {
        if (this.initPromise) {
            return this.initPromise;
        }
        if (this.options.fresh || this.status === -1) {
            this.initPromise = Promise.resolve();
            return this.initPromise;
        }
        this.initPromise = this.fileStore.get(this.options.cookie).then(content => {
            content = JSON.parse(content);
            if (helper.isEmpty(content)) return;

            if (content.expires < Date.now()) {
                return this.delete();
            }
            this.data = content.data || {};
        }).catch(err => debug(err));
        return this.initPromise;
    }

    get(name) {
        return this[initSessionData]().then(() => {
            if (this.options.autoUpdate) {
                this.status = 1;
            }
            return name ? this.data[name] : this.data;
        });
    }

    set(name, value) {
        return this[initSessionData]().then(() => {
            this.status = 1;
            if (value === null) {
                delete this.data[name];
            } else {
                this.data[name] = value;
            }
        });
    }

    delete() {
        this.status = -1;
        this.data = {};
        return Promise.resolve();
    }

    flush() {
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
    }

    gc() {
        const files = helper.getdirFiles(this.options.sessionPath);
        files.forEach(file => {
            const filePath = path.join(this.options.sessionPath, file);
            readFile(filePath, 'utf8').then(content => {
                if (!content) return Promise.reject(new Error('content empty'));
                content = JSON.parse(content);
                if (Date.now() > content.expires) {
                    return Promise.reject(new Error('session file expired'));
                }
            }).catch(() => {
                return unlink(filePath);
            });
        });
    }
};


module.exports = FileSession;

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule ? obj.default || obj : obj;
}