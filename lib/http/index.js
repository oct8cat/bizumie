const express = require('express')
const cors = require('cors')
const http = require('http')
const {createStaticLayer, createUploadLayer, createGraphQLLayer} = require('./layers')
const {createPassport} = require('./passport')
const {PORT} = require('../const')

exports.startServer = (server, {port = PORT} = {}) => {
  return new Promise((resolve, reject) => {
    server.on('error', reject).listen(port, () => resolve(server))
  })
}

exports.createServer = (app) => {
  return http.createServer(app)
}

exports.createApp = (ctx) => {
  const app = express()
  const passport = createPassport(ctx)
  app.use(createStaticLayer(ctx))
  app.use(cors())
  app.use(createJWTAuthLayer({passport, ...ctx}))
  app.post('/upload', createUploadLayer(ctx))
  app.use('/graphql', createGraphQLLayer(ctx))
  return app
}

const createJWTAuthLayer = (ctx) => {
  const {passport} = ctx
  const handleJWTAuth = passport.authenticate('jwt', {session: false})
  return (req, res, next) => {
    if (!req.headers['authorization']) return next()
    return handleJWTAuth(req, res, next)
  }
}
