var _ = require('lodash')

/**
 * base class for types
 *
 * contains default pass-through / noop behavior for types
 *
 * @class Base
 * @abstract subclass this to make concrete types
 * @param {*} raw value
 * @param {Object} [options] options for this value
 * @param {String} options.field field name in table, required if save needed
 * @param {bool} options.fromStored set to true if importing from stored value
 */
function Base (raw, options) {
  if (typeof options === 'undefined') { options = {} }
  this.options = options
  if (options.fromStored) { raw = this.fromStoredValue(raw) }
  this._raw = raw
  this._value = this.normalize(raw)
}

/**
 * checks whether the given arg is of current type
 *
 * - for declarative type, set it to {undefined} / omit it
 * - for dynamic type, set it to {function}
 *
 * @static
 * @method isTypeApplicable
 * @param {*} data arg set in type declaration
 * @return {bool} whethe the given arg is of the type of this class
 */
Base.isTypeApplicable = undefined

/**
 * get the raw value, the one initially set when initializing this instance
 *
 * @method getRaw
 * @param {void}
 * @return {*} raw value
 */
Base.prototype.getRaw = function() {
  return this._raw
}

/**
 * get the normalized value
 *
 * @method getValue
 * @param {void}
 * @return {*} normalized value from raw value
 */
Base.prototype.getValue = function() {
  return this._value
}

/**
 * check if current property is equal to given property
 *
 * @method isEqual
 * @param {*} comparator the property to compare against
 * @return {bool} whether the properties are equal
 */
Base.prototype.isEqual = function (comparator) {
  return this._value === comparator._value
}

/**
 * get the clause for SET, placeholders '?' matching in @see getSetValue
 *
 * @method getSetClause
 * @param {void}
 * @return {String} the clause with '?' as placeholders
 */
Base.prototype.getSetClause = function() {
  return '"' + this.options.field + '" = ?'
}

/**
 * get the value(s) matching the placeholders given by @see getSetClause
 *
 * note a single member array will be treated as one value
 * i.e. return [1] is treated as same as return 1
 * to return a single array, wrap it within another array
 * i.e. return [[1]]
 *
 * @method getSetValue
 * @param {*} [comparator] a comparator property
 * @return {*} value for store
 */
Base.prototype.getSetValue = function (comparator) {
  return this._getStoredValue()
}

/**
 * get the clause for WHERE, placeholders '?' matching in @see getWhereValue
 *
 * @method getWhereClause
 * @param {void}
 * @return {String} the clause with '?' as placeholders
 */
Base.prototype.getWhereClause = function() {
  return '"' + this.options.field + '" = ?'
}

/**
 * get the value(s) matching the placeholders given by @see getWhereClause
 *
 * note a single member array will be treated as one value
 * i.e. return [1] is treated as same as return 1
 * to return a single array, wrap it within another array
 * i.e. return [[1]]
 *
 * @method getWhereValue
 * @param {void}
 * @return {*} value for store
 */
Base.prototype.getWhereValue = function() {
  return this._getStoredValue()
}

/**
 * @method _getStoredValue
 * @see getSetValue
 * @see getWhereValue
 */
Base.prototype._getStoredValue = function() {
  return this._value
}

/**
 * normalize value from stored one to usable one
 *
 * @method fromStoredValue
 * @param {*} raw value from store
 * @return {*} normalized value
 */
Base.prototype.fromStoredValue = function (raw) {
  return raw
}

/**
 * normalize the raw value initialized
 *
 * polymorphic,
 * - if given a value arg, return a normalized version of arg
 * - if not given an arg, normalize this._value and returns it
 *
 * @method normalize
 * @param {*} [value] value to normalize
 * @return {*} normalized value
 */
Base.prototype.normalize = function (value) {
  if (typeof value === 'undefined') {
    this._value = this._normalize(this._value)
    return this._value
  } else {
    return this._normalize(value)
  }
}

/**
 * @method _normalize
 * @see normalize
 */
Base.prototype._normalize = function (value) {
  return value
}

/**
 * perform validation on the value
 *
 * @method validate
 * @param {void}
 * @return {String[]} array of strings, each coding an error
 */
Base.prototype.validate = function() {
  return []
}

/**
 * return the clause used in SET
 *
 * @method getSaveClause
 * @param {void}
 * @return {String} the SET clause
 */
Base.prototype.getSaveClause = function() {
  return '"' + this.options.field + '" = ?'
}

module.exports = Base
