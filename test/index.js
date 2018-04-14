/* eslint-env mocha */
const { path, is } = require('ramda')
const supertest = require('supertest')
const { resolve: resolvePath } = require('path')
const assert = require('assert')
const {
  user: { createUserToken },
  db: {
    createDb,
    connectDb,
    disconnectDb,
    getUserModel,
    getUploadModel,
    getPostModel
  }
} = require('bizumie-common')
const { graphql: { exec, schema, rs }, http: { createApp } } = require('..')

const db = createDb()
const app = createApp({ db })
const req = supertest(app)
const ctx = { db }

const userModel = getUserModel(db)
const uploadModel = getUploadModel(db)
const postModel = getPostModel(db)

let user

before(() => {
  return connectDb(db)
    .then(() => userModel.remove({}))
    .then(() => userModel.create({ displayName: 'test' }))
    .then((user_) => (user = user_))
})

after(() => disconnectDb(db))

it('As authorized user, view my profile', () => {
  return exec(schema, rs.meString, {}, { user, ...ctx }).then(
    ({ data: { me } }) => {
      assert.equal(me.id, user.id)
      assert.equal(me.displayName, user.displayName)
    }
  )
})
it('As registered user, authenticate using JWT', () => {
  return req
    .post('/graphql')
    .set('authorization', `Bearer ${createUserToken(user)}`)
    .send({ query: rs.meString })
    .then(({ body: { data: { me } } }) => {
      assert.equal(me.id, user.id)
    })
})
it('As authorized user, Upload/download file', () => {
  return req
    .post('/upload')
    .set('authorization', `Bearer ${createUserToken(user)}`)
    .attach('upload', resolvePath(__dirname, 'image.png'))
    .then(({ error, body, ...rest }) => {
      if (error) return Promise.reject(Object.assign(new Error(), body))
      const { upload } = body
      assert.equal(upload.user.id, user.id)
      return req.get(upload.url).then(({ headers }) => {
        assert.equal(headers['content-type'], 'application/octet-stream')
      })
    })
})
it('As authorized user, view uploads', () => {
  return uploadModel
    .remove({})
    .then(() => exec(schema, rs.uploadsString, {}, { user, ...ctx }))
    .then(({ data: { uploads } }) => assert.equal(uploads.length, 0))
    .then(() => {
      return req
        .post('/upload')
        .set('authorization', `Bearer ${createUserToken(user)}`)
        .attach('upload', resolvePath(__dirname, 'image.png'))
    })
    .then(() => exec(schema, rs.uploadsString, {}, { user, ...ctx }))
    .then(({ data: { uploads } }) => {
      assert.equal(uploads[0].user.id, user.id)
    })
})
it('As authorized user, view posts', () => {
  return postModel
    .remove({})
    .then(() => exec(schema, rs.postsString, {}, { user, ...ctx }))
    .then(({ errors, data }) => {
      assert.equal(errors, null)
      assert.ok(is(Array, data.posts))
    })
})
it('As authorized user, create post', () => {
  return postModel
    .remove({})
    .then(() =>
      exec(
        schema,
        rs.createPostString,
        { input: { title: 'test', text: 'test' } },
        { user, ...ctx }
      )
    )
    .then(({ errors, data }) => {
      assert.equal(errors, null)
      assert.equal(data.createPost.post.author.id, user.id)
    })
})
