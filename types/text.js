module.exports = function (utils) {
  var Base = require('./base')
  var _ = require('lodash')

  /**
   * text
   *
   * @class Text
   */
  function TextType() {
    Base.apply(this, arguments)
  }

  TextType.prototype = Object.create(Base.prototype)
  TextType.prototype.constructor = TextType

  TextType.prototype._normalize = function (value) {
    return value.toString()
  }

  TextType.prototype.validate = function() {
    if (_.isEmpty(this._value)) { return ['empty'] }
    return []
  }

  return TextType
}
