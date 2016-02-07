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
 * get the value suitable for storing in the store
 *
 * @method getStoredValue
 * @param {void}
 * @return {*} value for store
 */
Base.prototype.getStoredValue = function() {
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
