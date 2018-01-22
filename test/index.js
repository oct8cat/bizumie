/* eslint-env mocha */
const supertest = require('supertest')
const {clearDb, userModel, uploadModel, connectDb, disconnectDb, createDb} = require('../lib/db')
const {createApp} = require('../lib/http')
const path = require('path')
const assert = require('assert')
const {ERR_UNSUPPORTED, ERR_REQUIRED} = require('../lib/const')
const {exec, schema, requestStrings: {uploadsString, meString}} = require('../lib/graphql')
const {generateUserToken} = require('../lib/util')

const db = createDb()
const ctx = {db}
const app = createApp(ctx)
const req = supertest(app)

before(() => connectDb(db).then(clearDb))
after(() => disconnectDb(db))

describe('Upload file', () => {
  it('requires file', () => {
    return req
      .post('/upload')
      .then((res) => {
        assert.equal(res.status, 400)
        assert.ok(res.text.match(`${ERR_REQUIRED}: file`))
      })
  })
  it('rejects non-images', () => {
    return req
      .post('/upload')
      .attach('upload', path.resolve(__dirname, 'document.txt'))
      .then((res) => {
        assert.equal(res.status, 400)
        assert.ok(res.text.match(`${ERR_UNSUPPORTED}: text/plain`))
      })
  })
  it('actually works', () => {
    return req
      .post('/upload')
      .attach('upload', path.resolve(__dirname, 'image.png'))
      .then((res) => {
        assert.equal(res.status, 200)
        assert.ok(res.body.upload.id)
        assert.ok(res.body.upload.url)
        assert.equal(res.body.upload.user, null)
        return Promise.all([
          req.get(res.body.upload.url),
          uploadModel(db).findById(res.body.upload.id)
        ])
          .then(([res, upload]) => {
            assert.equal(res.status, 200)
            assert.equal(res.headers['content-type'], 'application/octet-stream')
            assert.equal(upload.mimetype, 'image/png')
            assert.equal(upload.originalname, 'image.png')
          })
      })
  })
  it('sets upload user for authorized users', () => {
    return clearDb(db)
      .then(() => userModel(db).create({displayName: 'uploader'}))
      .then((user) => {
        return req
          .post('/upload')
          .set('authorization', `Bearer ${generateUserToken(user)}`)
          .attach('upload', path.resolve(__dirname, 'image.png'))
          .then((res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.upload.user.id, user.id)
            return Promise.all([
              req.get(res.body.upload.url),
              uploadModel(db).findById(res.body.upload.id)
            ])
              .then(([res, upload]) => {
                assert.equal(res.status, 200)
                assert.equal(res.headers['content-type'], 'application/octet-stream')
                assert.equal(upload.user, user.id)
              })
          })
      })
  })
})

describe('View uploads', () => {
  it('actually works', () => {
    return clearDb(db)
      .then(() => exec(schema, uploadsString, {}, ctx))
      .then(({errors, data}) => {
        if (errors) return Promise.reject(Object.assign(new Error(), {errors}))
        assert.equal(data.uploads.length, 0)
      })
      .then(() => {
        return req
          .post('/upload')
          .attach('upload', path.resolve(__dirname, 'image.png'))
      })
      .then(() => exec(schema, uploadsString, {}, ctx))
      .then(({errors, data}) => {
        if (errors) return Promise.reject(Object.assign(new Error(), {errors}))
        assert.equal(data.uploads.length, 1)
        assert.ok(data.uploads[0].id)
        assert.ok(data.uploads[0].url)
      })
  })
})

describe('View current user profile', () => {
  it('is null for anonymous', () => {
    return exec(schema, meString, {}, ctx)
      .then(({errors, data}) => {
        if (errors) return Promise.reject(Object.assign(new Error(), {errors}))
        assert.equal(data.me, null)
      })
  })
  it('is an object for authorized user', () => {
    return exec(schema, meString, {}, {user: {id: 'foo'}, ...ctx})
      .then(({errors, data}) => {
        if (errors) return Promise.reject(Object.assign(new Error(), {errors}))
        assert.equal(data.me.id, 'foo')
      })
  })
})

describe('JWT authorization', () => {
  it('rejects invalid JWT', () => {
    return req
      .post('/graphql')
      .set('authorization', `Bearer foo`)
      .expect(401)
  })
  it('rejects token if the user is not found', () => {
    return req
      .post('/graphql')
      .set('authorization', `Bearer ${generateUserToken({id: '000000000000000000000000'})}`) // Token is valid, but the user is not found
      .expect(401)
  })
  it('accepts token if the user is found', () => {
    return clearDb(db)
      .then(() => userModel(db).create({displayName: 'foo'}))
      .then((user) => {
        return req
          .post('/graphql')
          .set('authorization', `Bearer ${generateUserToken(user)}`)
          .send({query: meString})
          .then((res) => {
            assert.equal(res.status, 200)
            assert.ok(res.body.data.me.id)
            assert.equal(res.body.data.me.displayName, 'foo')
          })
      })
  })
})
