import helper from "../helper"
import debug from 'debug';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';

const log = debug(`JH:core/events[${process.pid}]`);
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
    on(name, listener) {
        log(`on ${name}`);
        if (!isFunction(listener)) {
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
        log(`emit ${name}`);
        let listeners = this[EVENTS][name];
        if (isArray(listeners)) {
            for (let listener of listeners) {
                if (isFunction(listener)) {
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
    un(name, listener) {
        log(`un ${name}`);
        let listeners = this[EVENTS][name];
        if (isArray(listeners)) {
            for (let i in listeners) {
                if (listeners[i] == listener) {
                    delete listeners[i];
                }
            }
        }
    }
    
    /**
     *
     * @param name
     * @return {boolean}
     */
    isEvent(name) {
        return this[EVENTS][name] != null && this[EVENTS][name].length > 0
    }
}

export default Events;
