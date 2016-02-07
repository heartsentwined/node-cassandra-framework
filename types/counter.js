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
    this._diff = 0
  }

  CounterType.prototype = Object.create(Base.prototype)
  CounterType.prototype.constructor = CounterType

  /**
   * override: returns the diff in counter values, as expected by save clause
   */
  CounterType.prototype.getStoredValue = function() {
    return this._diff
  }

  CounterType.prototype._normalize = function (value) {
    return parseInt(value)
  }

  CounterType.prototype.getSaveClause = function() {
    return '"' + this.options.field + '" = "' + this.options.field + '" + ?'
  }

  CounterType.prototype.increment = function (step) {
    if (!step) { step = 1 }
    this._diff += step
    this._value += step
  }

  CounterType.prototype.decrement = function (step) {
    if (!step) { step = 1 }
    this._diff -= step
    this._value -= step
  }

  return CounterType
}
