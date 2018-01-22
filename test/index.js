/* eslint-env mocha */
const supertest = require('supertest')
const {clearDb, uploadModel, connectDb, disconnectDb, createDb} = require('../lib/db')
const {createApp} = require('../lib/http')
const path = require('path')
const assert = require('assert')
const {ERR_UNSUPPORTED, ERR_REQUIRED} = require('../lib/const')
const {exec, schema, requestStrings: {uploadsString}} = require('../lib/graphql')

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
        return Promise.all([
          uploadModel(db).findById(res.body.upload.id),
          req.get(res.body.upload.url)
        ])
          .then(([upload, res]) => {
            assert.equal(upload.mimetype, 'image/png')
            assert.equal(upload.originalname, 'image.png')
            assert.equal(res.status, 200)
            assert.equal(res.headers['content-type'], 'application/octet-stream')
          })
      })
  })
})

describe('List uploads', () => {
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
