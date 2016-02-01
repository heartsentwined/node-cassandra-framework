var cassandra = require('cassandra-driver')
var _ = require('lodash')
var fs = require('fs')
var path = require('path')

var types = {}
var declaratives = {}
var dynamics = {}

function getType (type) {
  if (_.isString(type) && declaratives[type]) { return declaratives[type] }
  return _.find(dynamics, function (dynamic) {
    return dynamic.isTypeApplicable(type)
  })
}

function normalizeProperty (details, property) {
  if (!_.isPlainObject(details)) { details = { type: details } }
  if (property && !details.field) { details.field = _.snakeCase(property) }
  details.Type = getType(details.type)
  if (details.Type) { return details }
}

function normalizeSchema (_schema) {
  var schema = {}
  _.each(_schema, function (_details, property) {
    var details = normalizeProperty(_details, property)
    if (details) { schema[property] = details }
  })
  return schema
}

var utils = {
  getType: getType,
  normalizeProperty: normalizeProperty,
  normalizeSchema: normalizeSchema,
}

var typeFiles = fs.readdirSync(path.join(__dirname, 'types'))
_.each(typeFiles, function (typeFile) {
  var name = path.parse(typeFile).name
  if (name === 'base') { return }
  var type = require('./types/' + name)(utils)
  types[name] = type
  types[_.upperFirst(_.camelCase(name))] = type // alias
  if (type.isTypeApplicable) {
    dynamics[name] = type
  } else {
    declaratives[name] = type
  }
})

var Model = require('./model')

function ORM (options) {
  this.client = new cassandra.Client(options)
  this.types = types
  this.Model = Model(this.client, utils)
  return this
}

module.exports = ORM
