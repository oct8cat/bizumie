const express = require('express')
const cors = require('cors')
const http = require('http')
const {createStaticLayer, createUploadLayer, createGraphQLLayer} = require('./layers')
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
  app.use(createStaticLayer(ctx))
  app.use(cors())
  app.post('/upload', createUploadLayer(ctx))
  app.use('/graphql', createGraphQLLayer(ctx))
  return app
}
