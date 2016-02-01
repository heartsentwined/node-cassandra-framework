module.exports = function (utils) {
  var Base = require('./base')
  var _ = require('lodash')

  /**
   * int
   *
   * @class Int
   */
  function IntType() {
    Base.apply(this, arguments)
  }

  IntType.prototype = Object.create(Base.prototype)
  IntType.prototype.constructor = IntType

  IntType.prototype._normalize = function (value) {
    return parseInt(value)
  }

  IntType.prototype.validate = function() {
    if (!_.isFinite(this._value)) { return ['int'] }
    return []
  }

  return IntType
}
