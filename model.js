module.exports = function (client, utils) {
  var _ = require('lodash')
  var async = require('async')

  function ModelBuilder (table, schema) {
    schema = utils.normalizeSchema(schema)

    function Model (data) {
      var _this = this
      this._ori = {}
      this._data = {}
      if (data) {
        this.import(data)
        _.each(this._data, function (value, property) {
          _this._ori[property] = value
        })
      } else {
        // TODO - handle this counter special case properly
        // always initialize a counter to zero
        _.each(schema, function (details, property) {
          if (details.type !== 'counter') { return }
          _this._data[property] = new details.Type(0, details)
        })
      }
    }

    Model.prototype.import = function (data) {
      var _this = this
      _.each(schema, function (details, property) {
        details.fromStored = true
        _this._data[property] = new details.Type(data[details.field], details)
      })
      return this
    }

    Model.prototype.validate = function (cb) {
      var _this = this
      var errors = []
      _.each(schema, function (details, property) {
        var _errors
        try {
          _errors = _.map(_this._data[property].validate(), function (error) {
            return property + '.' + error
          })
        } catch(e) { _errors = [property + '.malformed'] }
        errors = errors.concat(_errors)
      })
      cb(errors.length ? errors : null)
    }

    Model.prototype._diff = function() {
      var _this = this
      var hasChanges = false
      var hasKeyChanges = false

      _.each(this._data, function (value, property) {
        // key change implies [general] change; but not the other way round
        if (hasKeyChanges) { return }
        var changed
        if (_this._ori[property]) {
          changed = !value.isEqual(_this._ori[property])
        } else {
          changed = true
        }
        hasChanges = hasChanges || changed
        if (schema[property].key) { hasKeyChanges = hasKeyChanges || changed }
      })

      return { hasChanges: hasChanges, hasKeyChanges: hasKeyChanges }
    }

    Model.prototype.hasChanges = function() {
      return this._diff().hasChanges
    }

    Model.prototype.hasKeyChanges = function() {
      return this._diff().hasKeyChanges
    }

    Model.prototype.getSetClause = function (hasKeyChanges) {
      var _this = this
      var values = []
      var sets = _.compact(_.map(schema, function (details, property) {
        if (!details.key) {
          if (hasKeyChanges) {
            var value = _this._data[property].getSetValue()
          } else {
            var value = _this._data[property].getSetValue(_this._ori[property])
          }
          values = values.concat(_.isArray(value) ? value : [value])
          return _this._data[property].getSetClause()
        }
      })).join(',')
      return { clause: sets, values: values }
    }

    Model.prototype.getWhereClause = function (originalValues) {
      var data = originalValues ? this._ori : this._data
      var values = []
      var wheres = _.compact(_.map(schema, function (details, property) {
        if (details.key) {
          var value = data[property].getWhereValue()
          values = values.concat(_.isArray(value) ? value : [value])
          return data[property].getWhereClause()
        }
      })).join(' AND ')
      return { clause: wheres, values: values }
    }

    Model.prototype.save = function (cb) {
      var _this = this
      var hasChanges, hasKeyChanges

      async.waterfall([

        function (cb) { _this.validate(cb) },

        function (cb) {
          var _diff = _this._diff()
          hasChanges = _diff.hasChanges
          hasKeyChanges = _diff.hasKeyChanges

          if (!hasChanges) { return cb(null) }

          if (hasKeyChanges && _.size(_this._ori)) {
            var wheres = _this.getWhereClause(true)
            client.execute(
              'DELETE FROM "' + table
              + '" WHERE ' + wheres.clause
            , wheres.values, function (err) { cb(err) })
          } else {
            cb(null)
          }
        },

        function (cb) {
          if (!hasChanges) { return cb(null) }

          var sets = _this.getSetClause(hasKeyChanges)
          var wheres = _this.getWhereClause()
          var values = sets.values.concat(wheres.values)

          client.execute(
            'UPDATE "' + table
            + '" SET ' + sets.clause
            + ' WHERE ' + wheres.clause
          , values, function (err) { cb(err) })
        },

      ], cb)
    }

    // aliases
    Model.prototype.create = Model.prototype.save
    Model.prototype.update = Model.prototype.save

    // setters
    _.each(schema, function (details, property) {
      Object.defineProperty(Model.prototype, property, {
        enumerable: true,
        configurable: true,
        get: function() { return this._data[property].getValue() },
        set: function (value) {
          try {
            delete details.fromStored
            value = new details.Type(value, details)
          } catch(e) { value = undefined }
          this._data[property] = value
        }
      })
    })

    return Model
  }

  return ModelBuilder
}
