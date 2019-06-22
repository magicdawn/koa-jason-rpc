# koa-jayson-rpc

> koa json rpc powered by jayson

[![Build Status](https://img.shields.io/travis/magicdawn/koa-jayson-rpc.svg?style=flat-square)](https://travis-ci.org/magicdawn/koa-jayson-rpc)
[![Coverage Status](https://img.shields.io/codecov/c/github/magicdawn/koa-jayson-rpc.svg?style=flat-square)](https://codecov.io/gh/magicdawn/koa-jayson-rpc)
[![npm version](https://img.shields.io/npm/v/koa-jayson-rpc.svg?style=flat-square)](https://www.npmjs.com/package/koa-jayson-rpc)
[![npm downloads](https://img.shields.io/npm/dm/koa-jayson-rpc.svg?style=flat-square)](https://www.npmjs.com/package/koa-jayson-rpc)
[![npm license](https://img.shields.io/npm/l/koa-jayson-rpc.svg?style=flat-square)](http://magicdawn.mit-license.org)

## Install

```sh
$ npm i koa-jayson-rpc --save
```

## API

```js
const Rpc = require('koa-jayson-rpc')
```

### `rpc = new Rpc(options)`

#### `options.server`

new `Rpc` with a `jayson.Server` instance

#### `options.methods`

new `Rpc` with a `methods` map same as `jayson.Server(methods)`

#### `options.methodsDir` & `options.methodsDirOptions`

new `Rpc` with a `methods` map load from `methodsDir`,
and `methodsDirOptions` passed to `require-directory` module

### `app.use(rpc)`

> the `rpc` instance can be used as koa middleware or handler

#### use `koa-mount`

use `koa-mount` if you need server work on the `/jsonrpc` path

```js
const Koa = require('koa')
const mount = require('koa-mount')
const Rpc = require('koa-jayson-rpc')

const app = Koa()
const rpc = new Rpc({methodsDir: 'some-directory'})
app.use(mount('/jsonrpc', rpc))
```

#### use impress-router

```js
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

async function main() {
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
}
```

##### Notice

- `method` & `params` & `id` & `jsonrpc`: order `ctx.params` > `ctx.request.body` > `ctx.query`
- use `koa-qs` for pass `Object params` or `Array params` with `GET` request
  - `Array`: `params[]=1&params[]=2`
  - `Array`: `params[0]=1&params[1]=2`
  - `Object`: `params[name]=1&params[age]=2`

## Changelog

[CHANGELOG.md](CHANGELOG.md)

## License

the MIT License http://magicdawn.mit-license.org
