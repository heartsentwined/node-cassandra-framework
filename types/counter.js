module.exports = function (utils) {
  var Base = require('./base')
  var _ = require('lodash')

  /**
   * counter
   *
   * @class Counter
   */
  function CounterType() {
    Base.apply(this, arguments)
  }

  CounterType.prototype = Object.create(Base.prototype)
  CounterType.prototype.constructor = CounterType

  CounterType.prototype.getSetClause = function() {
    return '"' + this.options.field + '" = "' + this.options.field + '" + ?'
  }

  CounterType.prototype.getSetValue = function (comparator) {
    if (comparator) { return this._value - comparator._value }
    return this._value
  }

  CounterType.prototype.fromStoredValue = function (raw) {
    return parseInt(raw)
  }

  CounterType.prototype._normalize = function (value) {
    return parseInt(value)
  }

  return CounterType
}
