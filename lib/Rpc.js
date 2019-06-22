const assert = require('assert')
const _ = require('lodash')
const uuid = require('uuid/v4')
const jayson = require('jayson/promise')
const debug = require('debug')('koa-jayson-rpc:Rpc')
const {loadFromDir} = require('./util/index.js')

module.exports = class Rpc {
  constructor(options) {
    // the koa middleware
    // https://github.com/tedeh/jayson/blob/4cf84754e96cd5bc9186ac9be07d45d7fb515f57/lib/server/middleware.js#L36
    const rpc = async function jaysonRpcMiddleware(ctx, next) {
      assert(rpc.server, 'this.server can not be empty')

      // gen request
      const request = rpc._getRequest(ctx)
      debug('before request: %o', request)

      // request
      const responseBody = await new Promise((resolve, reject) => {
        rpc.server.call(request, function(error, success) {
          const response = error || success

          jayson.Utils.JSON.stringify(response, {}, (err, body) => {
            if (err) return reject(error)
            resolve(body)
          })
        })
      })

      // response
      ctx.type = 'json'
      ctx.body = responseBody
    }

    // keep prototype
    rpc.__proto__ = Rpc.prototype

    // initialize
    rpc.init(options)

    return rpc
  }

  init(options = {}) {
    // way 1
    // use `server`
    {
      const {server} = options
      if (server) {
        this.server = server
        return
      }
    }

    // way 2, use `methods`
    {
      const {methods} = options
      if (methods) {
        debug('init server with methods = %O', methods)
        const server = jayson.Server(methods)
        this.init({server})
        return
      }
    }

    // way3, use `methodsDir`
    {
      const {methodsDir, methodsDirOptions} = options
      if (methodsDir) {
        const {methods, services} = loadFromDir(methodsDir, methodsDirOptions)
        this.init({methods})
        return
      }
    }
  }

  _getRequest(ctx) {
    // get ctx.query
    // post ctx.body
    // route ctx.params

    const keys = ['jsonrpc', 'method', 'params', 'id']
    const request = _.defaults(
      {},
      _.pick(ctx.params, keys),
      _.pick(ctx.request.body, keys),
      _.pick(ctx.query, keys),
      {
        jsonrpc: '2.0',
        id: uuid(),
      }
    )

    debug('rpc request before validate: %o', request)

    // validate
    if (!request.method) {
      const type = 'BAD_REQUEST'
      const msg = 'missing required `method`'
      throw new Error(msg)
    }

    // params can be omit
    // if exist, must be Array or Object
    if (
      request.params &&
      !(Array.isArray(request.params) || typeof request === 'object')
    ) {
      const type = 'BAD_REQUEST'
      const msg = 'incorrect typeof `params`, must be Object or Array'
      throw new Error(msg)
    }

    return request
  }
}
