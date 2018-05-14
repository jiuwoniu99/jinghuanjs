import assert from "assert";
import time from "locutus/php/datetime/time";
import helper from '../helper';
import uuid from 'uuid';
import ksort from 'locutus/php/array/ksort';

const initSessionData = Symbol('jinghuan-session-db-init');

/**
 *
 */
class DbSession {
    data;
    key;
    
    /**
     *
     * @param ctx
     * @param options
     */
    constructor(ctx, options) {
        assert(options.table, '.table required');
        //
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
            
            let {id, table, fields, db_type} = this.options;
            
            let sessid = this.ctx.cookies.get(id);
            
            if (helper.isEmpty(sessid)) {
                try {
                    this.id = uuid.v4();
                    await this.ctx.db(table, db_type).insert({id: this.id, data: '{}', expires: time()})
                } catch (e) {
                    console.error(e);
                } finally {
                    this.data = {};
                }
            } else {
                try {
                    this.data = {};
                    // 查询数据
                    let data = await this.ctx.db(table, db_type)
                        .where({id: sessid})
                        .first();
                    
                    this.data = JSON.parse(data.data);
                    
                    // session 过时
                    if (data[this.expires] < time()) {
                        this.data = {}
                    }
                } catch (e) {
                    this.data = {}
                    console.error(e);
                }
            }
        }
        
        ksort(this.data);
        this.key = helper.md5(JSON.stringify(this.data));
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
        let {table, db_type} = this.options;
        
        ksort(this.data);
        let key = helper.md5(JSON.stringify(this.data));
        if (this.key !== key) {
            let val = {
                data: JSON.stringify(this.data),
                expires: time() + this.options.expires
            };
            await this.ctx.db(table, db_type)
                .where({id: this.id})
                .update(val);
            this.ctx.cookies.set(this.options.id, this.id, {maxAge: this.options.expires})
        }
    }
    
}

export default DbSession;
