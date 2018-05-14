import helper from '../helper'
import parseAdapter from '../helper/parseAdapter';
import assert from "assert"

/**
 *
 */
class Session {
    options = {};
    ctx;
    cache = {};
    
    /**
     *
     * @param ctx
     */
    constructor(ctx) {
        this.ctx = ctx
    }
    
    run = async (name, value, options) => {
        
        let config = jinghuan.config('session');
        this.options = parseAdapter(config, options);
        
        assert(helper.isFunction(this.options.handle), 'session.handle must be a function');
        
        let Adapter = this.options.handle;
        let key = helper.md5(JSON.stringify(this.options));
        
        if (!this.cache[key])
            this.cache[key] = new Adapter(this.ctx, this.options.options);
        
        
        if (helper.isEmpty(value)) {
            return await this.cache[key].get(name)
        } else {
            return await this.cache[key].set(name, value)
        }
        
    };
}

/**
 *
 * @param name
 * @param value
 * @param options
 * @return {*}
 */
export default Session;
