module.exports = function (utils) {
  var Base = require('./base')
  var Big = require('big.js')
  var _ = require('lodash')

  /**
   * decimal
   *
   * @class Decimal
   * @param {int} options.precision number of decimal places
   */
  function DecimalType() {
    Base.apply(this, arguments)
  }

  DecimalType.prototype = Object.create(Base.prototype)
  DecimalType.prototype.constructor = DecimalType

  DecimalType.prototype.getStoredValue = function() {
    return this._value.times(Big(10).pow(this.options.precision))
  }

  DecimalType.prototype.fromStoredValue = function (raw) {
    return Big(raw).div(Big(10).pow(this.options.precision))
  }

  DecimalType.prototype._normalize = function (value) {
    return Big(value).round(this.options.precision)
  }

  DecimalType.prototype.validate = function() {
    if (_.isEmpty(this._value)) { return ['empty'] }
    return []
  }

  return DecimalType
}
