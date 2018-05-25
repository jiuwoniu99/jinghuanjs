import action from './action';
import api from './api';
import rest from './rest';
import rpc from './rpc';
import socket from './socket';
import validate from './validate';

import define from '../core/helper/define';

/**
 *
 * @type {{action: action, api, rest, rpc}}
 */
define('props', {action, api, rest, rpc, socket, validate});
define('PropAction', action, global);
define('PropApi', api, global);
define('PropRest', rest, global);
define('PropRpc', rpc, global);
define('PropSocket', socket, global);
define('PropValidate', validate, global);
