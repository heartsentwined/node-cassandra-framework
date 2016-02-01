module.exports = function (utils) {
  var Base = require('./base')
  var _ = require('lodash')

  /**
   * uuid
   *
   * @class Uuid
   */
  function UuidType() {
    Base.apply(this, arguments)
  }

  UuidType.prototype = Object.create(Base.prototype)
  UuidType.prototype.constructor = UuidType

  UuidType.prototype.normalize = function (value) {
    return value.toString()
  }

  UuidType.prototype.validate = function() {
    if (_.isEmpty(this._value)) { return ['empty'] }
    return []
  }

  return UuidType
}
