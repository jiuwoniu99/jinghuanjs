const helper = require('think-helper');

/**
 *
 */
class Events {
	constructor() {
		this._events = {};
	}
	
	/**
	 *
	 * @param name
	 * @param listener
	 * @return {Promise<void>}
	 */
	async on(name, listener) {
		if (!helper.isFunction(listener))
			throw TypeError('listener must be a function');
		this._events[name] = this._events['name'] || [];
		this._events[name].push(listener)
	}
	
	/**
	 *
	 * @param name
	 * @param args
	 * @return {Promise<void>}
	 */
	async emit(name, ...args) {
		let listeners = this._events[name];
		if (helper.isArray(listeners)) {
			for (let listener of listeners) {
				if (helper.isFunction(listener))
					await listener(...args)
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
		let listeners = this._events[name];
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
