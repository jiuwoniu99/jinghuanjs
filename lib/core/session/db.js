const assert = require('assert');
const initSessionData = Symbol('jinghuan-session-db-init');

/**
 *
 */
class DbSession {
    /**
     *
     * @param options
     * @param ctx
     */
    constructor(options, ctx) {
        assert(options.table, '.table required');
        //
        this.options = options;

        //
        this.key = 'id';
        this.content = 'data';
        this.expires = 'expires';

        //
        if (this.options.fields) {
            let {key, content, expires} = this.options.fields;
            this.key = key || this.key;
            this.content = content || this.content;
            this.expires = expires || this.expires;
        }

        //
        this.ctx = ctx;
        this.ctx.res.once('finish', async() => {
            await this.flush();
        });
    }

    /**
     *
     * @return {Promise<void>}
     */
    async [initSessionData]() {
        if (this.data) {
        }
        else {
            // 查询数据
            let data = await this.ctx.knex(this.options.table)
                .where(this.key, this.options.cookie)
                .first();

            if (data == null) {
                let val = {};
                val[this.key] = this.options.cookie;
                val[this.content] = JSON.stringify({});
                val[this.expires] = Date.now() + this.options.maxAge;

                // 创建数据
                await this.ctx.knex(this.options.table).insert(val);
                this.data = {};
            } else {
                // 解析数据
                try {
                    this.data = JSON.parse(data.data);
                } catch (ex) {
                    this.data = {};
                }

                // session 过时
                if (data[this.expires] < Date.now()) {
                    this.delete();
                }
            }
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
        // this.status = -1;
        this.data = {};
    }

    /**
     *
     * @return {Promise<void>}
     */
    async flush() {
        let val = {};
        val[this.content] = JSON.stringify(this.data);
        val[this.expires] = Date.now() + this.options.maxAge;

        await this.ctx.knex(this.options.table)
            .where(this.key, this.options.cookie)
            .update(val);
    }

    /**
     * gc
     */
    gc() {
    }
}

module.exports = DbSession;
