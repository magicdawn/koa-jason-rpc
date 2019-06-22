const {resolve: pathresolve} = require('path')
const _ = require('lodash')
const jayson = require('jayson/promise')
const requireDirectory = require('require-directory')

function collapse(stem, sep) {
  return function(map, value, key) {
    key = _.camelCase(key) // prevent `-`

    const prop = stem ? stem + sep + key : key
    if (_.isFunction(value)) map[prop] = value
    else if (_.isObject(value)) map = _.reduce(value, collapse(prop, sep), map)
    return map
  }
}

/**
 * 从文件夹加载
 * services: { a: { b: function() {} } }
 * methods: { 'a.b': function() {} }
 */

module.exports = function loadFromDir(dir, options) {
  dir = pathresolve(dir)
  const services = requireDirectory(module, dir, options)
  const methods = _.reduce(services, collapse('', '.'), {})
  return {services, methods}
}
