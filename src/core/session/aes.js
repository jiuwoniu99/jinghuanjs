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
                try {
                    let data = JSON.parse(this.decrypt(sessid, this.options.secret));
                    ksort(data);
                    this.data = data;
                } catch (e) {
                    this.data = {};
                }
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
            try {
                let txt = this.encrypt(JSON.stringify(this.data), this.options.secret);
                this.ctx.cookies.set(this.options.id, txt, {maxAge: this.options.expires})
            } catch (e) {
                console.error(e);
            }
        }
    }
    
    /**
     * 加密
     * @param text
     * @param secrect
     * @return {*}
     */
    encrypt(text, secrect) {
        let aes_secrect = helper.md5(secrect);
        let cipher = crypto.createCipher(this.aes_algorithm, aes_secrect);
        let crypted = cipher.update(text, 'utf8', 'base64');
        crypted += cipher.final('base64');
        return crypted;
    }
    
    /**
     * 解密
     * @param text
     * @param secrect
     * @return {*}
     */
    decrypt = function (text, secrect) {
        let aes_secrect = helper.md5(secrect);
        let decipher = crypto.createDecipher(this.aes_algorithm, aes_secrect);
        let dec = decipher.update(text, 'base64', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    }
    
}

export default JwtSession;
