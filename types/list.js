module.exports = function (utils) {
  var Base = require('./base')
  var _ = require('lodash')

  /**
   * list
   *
   * @class List
   */
  function ListType (raw, options) {
    options.type[0] = utils.normalizeProperty(options.type[0])
    if (options.fromStored) { options.type[0].fromStored = true }
    Base.apply(this, [raw, options])
  }

  ListType.prototype = Object.create(Base.prototype)
  ListType.prototype.constructor = ListType

  ListType.isTypeApplicable = function (type) {
    return _.isArray(type)
  }

  ListType.prototype.getValue = function() {
    return _.map(this._value, function (value) {
      return value.getValue()
    })
  }

  ListType.prototype.getStoredValue = function() {
    return _.map(this._value, function (value) {
      return value.getStoredValue()
    })
  }

  ListType.prototype._normalize = function (value) {
    var _this = this
    return _.map(this._raw, function (raw) {
      return new _this.options.type[0].Type(raw, _this.options.type[0])
    })
  }

  /*
   * TODO - should I flatten it?
   */
  ListType.prototype.validate = function() {
    return _.compact(_.map(this._value, function (value) {
      var errors = value.validate()
      return errors.length ? errors : null
    }))
  }

  return ListType
}
