module.exports = function (utils) {
  var Base = require('./base')
  var _ = require('lodash')
  var cassandra = require('cassandra-driver')

  /**
   * tuple
   *
   * @class Tuple
   */
  function TupleType (raw, options) {
    _.each(options.members, function (details, key) {
      options.members[key] = utils.normalizeProperty(details)
      if (options.fromStored) {
        options.members[key].fromStored = true
      } else {
        delete options.members[key].fromStored
      }
    })
    Base.apply(this, [raw, options])
  }

  TupleType.prototype = Object.create(Base.prototype)
  TupleType.prototype.constructor = TupleType

  TupleType.prototype.getValue = function() {
    return _.map(this._value, function (value) {
      return value.getValue()
    })
  }

  TupleType.prototype.isEqual = function (comparator) {
    if (this._value.length !== comparator._value.length) { return false }
    var isEqual = true
    _.each(this._value, function (value, key) {
      if (!isEqual) { return }
      isEqual = value.isEqual(comparator._value[key])
    })
    return isEqual
  }

  TupleType.prototype._getStoredValue = function() {
    var Tuple = cassandra.types.Tuple
    var args = [null].concat(_.map(this._value, function (value) {
      return value._getStoredValue()
    }))
    var tuple = new (Function.prototype.bind.apply(Tuple, args))
    return tuple
  }

  TupleType.prototype.fromStoredValue = function (raw) {
    return raw.values()
  }

  TupleType.prototype._normalize = function (value) {
    var _this = this
    return _.map(this._raw, function (raw, key) {
      return new _this.options.members[key].Type(raw, _this.options.members[key])
    })
  }

  /*
   * TODO - should I flatten it?
   */
  TupleType.prototype.validate = function() {
    return _.compact(_.map(this._value, function (value) {
      var errors = value.validate()
      return errors.length ? errors : null
    }))
  }

  return TupleType
}
