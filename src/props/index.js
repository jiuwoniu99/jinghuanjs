import action from './action';
import api from './api';
import rest from './rest';
import rpc from './rpc';

/**
 *
 * @type {{action: action, api, rest, rpc}}
 */
const props = {action, api, rest, rpc};

/**
 *
 */
Object.defineProperty(jinghuan, 'props', {
	get() {
		return props;
	}
});
