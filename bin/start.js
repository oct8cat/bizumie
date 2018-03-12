const {
  db: { createDb, connectDb, disconnectDb },
  http: { stopServer, createServer, startServer }
} = require('bizumie-common')
const { http: { createApp } } = require('..')

const start = (exports.start = () => {
  const db = createDb()
  const app = createApp({ db })
  const server = createServer(app)
  return connectDb(db)
    .then(() => startServer(server))
    .then((server) => ({ db, app, server }))
})

exports.stop = ({ db, server, ...rest } = {}) => {
  return stopServer(server)
    .then(() => disconnectDb(db))
    .then(() => ({ db, server, ...rest }))
}

if (require.main === module) start()
