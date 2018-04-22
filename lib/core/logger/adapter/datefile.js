'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Base = require('./base');

module.exports = function (_Base) {
  _inherits(DateFileLogger, _Base);

  function DateFileLogger() {
    _classCallCheck(this, DateFileLogger);

    return _possibleConstructorReturn(this, _Base.apply(this, arguments));
  }

  DateFileLogger.prototype.formatConfig = function formatConfig(config) {
    // eslint-disable-next-line prefer-const
    var level = config.level,
        filename = config.filename,
        pattern = config.pattern,
        alwaysIncludePattern = config.alwaysIncludePattern,
        absolute = config.absolute,
        layout = config.layout;

    level = level ? level.toUpperCase() : 'ALL';

    return Object.assign({
      appenders: {
        dateFile: { type: 'dateFile', filename: filename, pattern: pattern, alwaysIncludePattern: alwaysIncludePattern, absolute: absolute, layout: layout }
      },
      categories: {
        default: { appenders: ['dateFile'], level: level }
      }
    }, config);
  };

  return DateFileLogger;
}(Base);