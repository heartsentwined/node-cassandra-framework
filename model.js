module.exports = function (client, utils) {
  var _ = require('lodash')

  function Model (table, schema) {
    schema = utils.normalizeSchema(schema)

    function Base (data) {
      this._data = {}
      if (data) { this.import(data) }
    }

    Base.prototype.import = function (data) {
      var _this = this
      _.each(schema, function (details, property) {
        details.fromStored = true
        _this._data[property] = new details.Type(data[details.field], details)
      })
      return this
    }

    Base.prototype.validate = function (cb) {
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

    Base.prototype.getStoredValues = function() {
      var _this = this
      return _.map(schema, function (details, property) {
        return _this._data[property].getStoredValue()
      })
    }

    /*
     * TODO
     * current behavior: silently ignore changes to PK values
     * should be: silently delete-and-recreate on change to PK values
     */
    Base.prototype.save = function (cb) {
      var _this = this
      this.validate(function (err) {
        if (err) { return cb(err) }

        var values = []
        var sets = _.compact(_.map(schema, function (details, property) {
          if (details.key) {
            return null
          } else {
            values.push(_this._data[property].getStoredValue())
            return _this._data[property].getSaveClause()
          }
        })).join(',')
        var wheres = _.compact(_.map(schema, function (details, property) {
          if (details.key) {
            values.push(_this._data[property].getStoredValue())
            return '"' + details.field + '" = ?'
          } else {
            return null
          }
        })).join(' AND ')

        client.execute(
          'UPDATE "' + table + '" SET ' + sets + ' WHERE ' + wheres
        , values, cb)
      })
    }

    // aliases
    Base.prototype.create = Base.prototype.save
    Base.prototype.update = Base.prototype.save

    // setters
    _.each(schema, function (details, property) {
      Object.defineProperty(Base.prototype, property, {
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

    return Base
  }

  return Model
}
