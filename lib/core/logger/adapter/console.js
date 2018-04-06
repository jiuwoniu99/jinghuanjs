'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Base = require('./base');

module.exports = function (_Base) {
  _inherits(ConsoleLogger, _Base);

  function ConsoleLogger() {
    _classCallCheck(this, ConsoleLogger);

    return _possibleConstructorReturn(this, _Base.apply(this, arguments));
  }

  ConsoleLogger.prototype.formatConfig = function formatConfig(config) {
    var level = config.level,
        layout = config.layout;

    level = level ? level.toUpperCase() : 'ALL';
    layout = layout || { type: 'pattern', pattern: '%[[%d] [%z] [%p]%] - %m' };

    return Object.assign({
      appenders: {
        console: { type: 'console', layout: layout }
      },
      categories: {
        default: { appenders: ['console'], level: level }
      }
    }, config);
  };

  return ConsoleLogger;
}(Base);