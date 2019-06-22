const Rpc = require('./Rpc.js')
module.exports = Rpc

const {loadFromDir, createProxy} = require('./util/index.js')
Object.assign(module.exports, {
  loadFromDir,
  createProxy,
})
