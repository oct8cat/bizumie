/* eslint-env mocha */
const supertest = require('supertest')
const path = require('path')
const assert = require('assert')
const WebSocket = require('ws')
const {clearDb, userModel, connectDb, disconnectDb, createDb} = require('../lib/db')
const {stopWSServer, stopServer, createWSServer, startServer, createServer, createApp} = require('../lib/http')
const {exec, schema, requestStrings: {uploadsString, meString}} = require('../lib/graphql')
const {generateUserToken} = require('../lib/util')
const {HOST, PORT} = require('../lib/const')

const db = createDb()
const ctx = {db}
const app = createApp(ctx)
const req = supertest(app)

before(() => connectDb(db).then(clearDb))
after(() => disconnectDb(db))

describe('As anonymous', () => {
  it('Authorize with JWT', () => {
    return clearDb(db)
      .then(() => userModel(db).create({}))
      .then((user) => {
        return req
          .post('/graphql')
          .set('authorization', `Bearer ${generateUserToken(user)}`)
          .send({query: meString})
          .then(({body: {data: {me}}}) => {
            assert.equal(me.id, user.id)
          })
      })
  })
  describe('Interact with web socket', () => {
    let server, wsServer
    beforeEach(() => {
      server = createServer()
      wsServer = createWSServer({server})
      return startServer(server)
    })
    afterEach(() => {
      return stopWSServer(wsServer)
        .then(() => stopServer(server))
    })
    it('Connect to public web socket', () => {
      return new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://${HOST}:${PORT}`)
        ws.on('error', reject)
        ws.on('pong', resolve)
        ws.on('open', () => ws.ping())
      })
    })
  })
})

describe('As authorized user', () => {
  let user
  beforeEach(() => {
    return clearDb(db)
      .then(() => userModel(db).create({displayName: 'authorized user'}))
      .then((user_) => (user = user_))
  })
  it('View my profile', () => {
    return exec(schema, meString, {}, {user, ...ctx})
      .then(({errors, data}) => {
        if (errors) return Promise.reject(Object.assign(new Error(), {errors}))
        assert.equal(data.me.id, user.id)
        assert.equal(data.me.displayName, 'authorized user')
      })
  })
  it('Upload file', () => {
    return req
      .post('/upload')
      .set('authorization', `Bearer ${generateUserToken(user)}`)
      .attach('upload', path.resolve(__dirname, 'image.png'))
      .then(({status, body: {upload}}) => {
        assert.equal(status, 200)
        assert.equal(upload.user.id, user.id)
        return req
          .get(upload.url)
          .then(({status, headers}) => {
            assert.equal(status, 200)
            assert.equal(headers['content-type'], 'application/octet-stream')
          })
      })
  })
  it('View uploads', () => {
    return exec(schema, uploadsString, {}, {user, ...ctx})
      .then(({data: {uploads}}) => {
        assert.equal(uploads.length, 0)
      })
      .then(() => {
        return req
          .post('/upload')
          .set('authorization', `Bearer ${generateUserToken(user)}`)
          .attach('upload', path.resolve(__dirname, 'image.png'))
      })
      .then(() => exec(schema, uploadsString, {}, {user, ...ctx}))
      .then(({data: {uploads}}) => {
        assert.equal(uploads[0].user.id, user.id)
      })
  })
})
