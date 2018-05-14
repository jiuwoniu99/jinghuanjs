import assert from "assert"
import time from "locutus/php/datetime/time"
import helper from '../helper'
import path from 'path';
import fs from 'fs-extra'
import ksort from 'locutus/php/array/ksort';
import crypto from 'crypto';
import pako from 'pako';

const initSessionData = Symbol('jinghuan-session-db-init');

/**
 *
 */
class JwtSession {
    
    data;
    aes_algorithm = "aes-256-ecb";
    
    constructor(ctx, options) {
        this.ctx = ctx;
        this.options = options;
        
        this.ctx.events.on('finish', async () => {
            await this.flush();
        });
    }
    
    /**
     *
     * @return {Promise<void>}
     */
    async [initSessionData]() {
        if (this.data == null) {
            let sessid = this.ctx.cookies.get(this.options.id);
            if (helper.isEmpty(sessid)) {
                this.data = {}
            } else {
                let promise = new Promise((resolve, reject) => {
                    let cb = (err, json) => {
                        if (err) {
                            resolve({});
                        } else {
                            ksort(json);
                            resolve(json);
                        }
                    };
                    if (!helper.isEmpty(this.options.privateKey) && helper.isFile(this.options.privateKey)) {
                        let cert = fs.readFileSync(this.options.privateKey);
                        jinghuan.jwt.verify(sessid, cert, cb);
                    } else {
                        jinghuan.jwt.verify(sessid, this.options.secret, cb);
                    }
                    
                });
                this.data = await promise;
            }
            this.key = helper.md5(JSON.stringify(this.data));
        }
    }
    
    /**
     *
     * @param name
     * @return {Promise<{}|*>}
     */
    async get(name) {
        await this[initSessionData]();
        return name ? this.data[name] : this.data;
    }
    
    /**
     *
     * @param name
     * @param value
     * @return {Promise<void>}
     */
    async set(name, value) {
        await this[initSessionData]();
        if (value === null) {
            delete this.data[name];
        } else {
            this.data[name] = value;
        }
    }
    
    /**
     *
     * @return {Promise<void>}
     */
    async delete() {
        this.data = {};
    }
    
    /**
     *
     * @return {Promise<void>}
     */
    async flush() {
        let key = helper.md5(JSON.stringify(this.data));
        if (key !== this.key) {
            let token = '';
            if (!helper.isEmpty(this.options.privateKey) && helper.isFile(this.options.privateKey)) {
                let cert = fs.readFileSync(this.options.privateKey);
                token = jinghuan.jwt.sign(this.data, cert, {algorithm: 'HS256', expiresIn: this.options.expires});
            } else {
                token = jinghuan.jwt.sign(this.data, this.options.secret, {expiresIn: this.options.expires});
            }
            //this.ctx.set({
            //    'x-token': token
            //});
            this.ctx.cookies.set(this.options.id, token, {maxAge: this.options.expires})
        }
    }
}

export default JwtSession;
