'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Base = require('./base');

module.exports = function (_Base) {
  _inherits(GelfLogger, _Base);

  function GelfLogger() {
    _classCallCheck(this, GelfLogger);

    return _possibleConstructorReturn(this, _Base.apply(this, arguments));
  }

  GelfLogger.prototype.formatConfig = function formatConfig(config) {
    var level = config.level,
        host = config.host,
        hostname = config.hostname,
        port = config.port,
        facility = config.facility;

    return Object.assign({
      appenders: {
        gelf: { type: 'gelf', host: host, hostname: hostname, port: port, facility: facility }
      },
      categories: {
        default: { appenders: ['gelf'], level: level }
      }
    }, config);
  };

  return GelfLogger;
}(Base);