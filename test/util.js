const {loadFromDir, createProxy} = require('../lib/util/index.js')
const jayson = require('jayson/promise')
const Rpc = require('../lib/Rpc.js')

describe('Rpc.<util-method>', function() {
  it('loadFromDir', () => {
    const {methods} = loadFromDir(__dirname + '/fixtures/server')

    // plain object, not nested
    for (let key in methods) {
      const val = methods[key]
      ;(typeof val).should.equal('function')
    }
  })

  it('createProxy', async () => {
    // server
    const rpc = new Rpc({methodsDir: __dirname + '/fixtures/server'})
    const httpServer = rpc.server.http()
    httpServer.listen(0)
    const port = httpServer.address().port

    // client
    const client = jayson.client.http({port})
    const proxy = createProxy(async ({path, args}) => {
      if (args.length > 1) {
        throw new Error('params.length should be 1 or 0')
      }

      const arg = args[0]
      // https://www.jsonrpc.org/specification#parameter_structures
      // by-position: params MUST be an Array, containing the values in the Server expected order.
      // by-name: params MUST be an Object,
      if (arg && !(Array.isArray(arg) || typeof arg === 'object')) {
        throw new Error('params must be Array or Object')
      }

      return client.request(path, arg)
    })
    let json

    json = await proxy.echo({test: 'createProxy works'})
    json.result.should.eql({test: 'createProxy works'})

    // other
    await proxy.foo.fooChild1([1, 2])
    await proxy.foo.fooChild1([1])
    await proxy.hello.world([1])
    await proxy.test.serverError()

    console.log(proxy)

    // stop
    await new Promise(r => httpServer.close(r))
  })
})
