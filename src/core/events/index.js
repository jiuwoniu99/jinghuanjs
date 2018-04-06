//
//const _ = require('lodash');
const debug = require('debug')(`JH:core/events[${process.pid}]`);
const helper =require('../helper');
//
const EVENTS = Symbol('events');

/**
 *
 */
class Events {
    constructor() {
        this[EVENTS] = {};
    }

    /**
     *
     * @param name
     * @param listener
     * @return {Promise<void>}
     */
    async on(name, listener) {
        debug(`on ${name}`);
        if (!helper.isFunction(listener)) {
            throw TypeError('listener must be a function');
        }
        this[EVENTS][name] = this[EVENTS]['name'] || [];
        this[EVENTS][name].push(listener);
    }

    /**
     *
     * @param name
     * @param args
     * @return {Promise<void>}
     */
    async emit(name, ...args) {
        debug(`emit ${name}`);
        let listeners = this[EVENTS][name];
        if (helper.isArray(listeners)) {
            for (let listener of listeners) {
                if (helper.isFunction(listener)) {
                    await listener(...args);
                }
            }
        }
    }

    /**
     *
     * @param name
     * @param listener
     * @return {Promise<void>}
     */
    async un(name, listener) {
        debug(`un ${name}`);
        let listeners = this[EVENTS][name];
        if (helper.isArray(listeners)) {
            for (let i in listeners) {
                if (listeners[i] == listener) {
                    delete listeners[i];
                }
            }
        }
    }
}

module.exports = Events;
