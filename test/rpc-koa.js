const jayson = require('jayson/promise')
const should = require('should')
const Rpc = require('../lib/Rpc.js')
const {loadFromDir} = require('../lib/util/index.js')
const uuid = require('uuid/v4')
const request = require('supertest')

const setupKoaApp = () => {
  const Koa = require('koa')
  const Router = require('impress-router')

  const app = new Koa()
  const router = new Router()
  router.augmentApp(app)

  require('koa-onerror')(app)
  require('koa-qs')(app, 'extended')

  // post body
  const bodyParser = require('koa-bodyparser')
  app.use(
    bodyParser({
      formLimit: '5mb',
      jsonLimit: '5mb',
      textLimit: '5mb',
    })
  )

  return app
}

describe('Rpc koa related', function() {
  it('middleware works', async function() {
    const rpc = new Rpc({methodsDir: __dirname + '/fixtures/server'})
    const app = setupKoaApp()

    // use rpc middleware
    app.all('/jsonrpc', rpc)
    app.all('/jsonrpc/:method', rpc)

    const server = app.callback()
    let json

    json = await request(server)
      .post('/jsonrpc')
      .send({method: 'echo', params: {test: 'middleware works'}})
      .then(res => res.body)
    json.result.should.eql({test: 'middleware works'})

    // use params.method
    json = await request(server)
      .post('/jsonrpc/echo')
      .send({params: {test: 'params route works too'}})
      .then(res => res.body)
    json.result.should.eql({test: 'params route works too'})
  })
})
