import action from './action';
import api from './api';
import rest from './rest';
import rpc from './rpc';
import define from '../core/helper/define';

/**
 *
 * @type {{action: action, api, rest, rpc}}
 */
define('props', {action, api, rest, rpc});
