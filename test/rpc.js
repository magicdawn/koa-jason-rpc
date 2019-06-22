const jayson = require('jayson/promise')
const should = require('should')
const Rpc = require('../lib/Rpc.js')
const {loadFromDir} = require('../lib/util/index.js')
const uuid = require('uuid/v4')

const rpcWorks = async rpc => {
  const httpServer = rpc.server.http()
  httpServer.listen(0)

  const port = httpServer.address().port
  const client = jayson.client.http({port})

  const random = uuid()
  const ret = await client.request('echo', [random])

  ret.result.should.be.Array()
  ret.result.should.eql([random])

  // stop
  await new Promise(r => httpServer.close(r))
}

describe('new Rpc', function() {
  it('with {server}', async function() {
    const {methods} = loadFromDir(__dirname + '/fixtures/server/')
    const server = jayson.server(methods)
    const rpc = new Rpc({
      server,
    })

    await rpcWorks(rpc)
  })

  it('with {methods}', async function() {
    const {methods} = loadFromDir(__dirname + '/fixtures/server/')
    const rpc = new Rpc({
      methods,
    })
    await rpcWorks(rpc)
  })

  it('with {methodsDir}', async function() {
    const rpc = new Rpc({
      methodsDir: __dirname + '/fixtures/server/',
    })
    await rpcWorks(rpc)
  })
})
