const Koa = require('koa')
const Router = require('impress-router')
const mount = require('koa-mount')
const jayson = require('jayson/promise')

const app = new Koa()
const router = new Router()
router.augmentApp(app)

require('koa-onerror')(app)
require('koa-qs')(app, 'extended')

const Rpc = require('../lib/Rpc.js')
// const {methods} = Rpc.util.loadFromDir(__dirname + '../test/fixtures/server/')
// const server = jayson.server(methods)
// const rpc = new Rpc({
//   server,
// })

// const {methods} = Rpc.util.loadFromDir(__dirname + '../test/fixtures/server/')
// const server = jayson.server(methods)
// const rpc = new Rpc({
//   server,
// })

const rpc = new Rpc({
  methodsDir: __dirname + '/../test/fixtures/server/',
})
app.all('/jsonrpc', rpc)
app.all('/jsonrpc/:method', rpc)

app.listen(4000, function() {
  console.log(
    `JaysonRpcServer listened on http://localhost:${this.address().port}`
  )
})

// array: params[]=1&params[]=2
// array: params[0]=1&params[1]=2
// object: ?params[name]=1&params[age]=2
