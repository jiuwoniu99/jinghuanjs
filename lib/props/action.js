'use strict';

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const symbol = Symbol(_uuid2.default.v4());

const action = function (props) {
	return function (target, name, descriptor) {
		let { initializer, value } = descriptor;
		if (!target[symbol]) {
			Object.defineProperty(target, symbol, {
				configurable: false,
				enumerable: false,
				writable: false,
				value: {}
			});
		}

		Object.defineProperty(target[symbol], name, {
			configurable: false,
			enumerable: false,
			writable: false,
			value: {
				initializer,
				value,
				props
			}
		});
	};
};

Object.defineProperty(action, 'name', {
	configurable: false,
	enumerable: false,
	writable: false,
	value: symbol
});
module.exports = action;