const {createDb, connectDb, disconnectDb} = require('../lib/db')
const {stopServer, createApp, createServer, startServer} = require('../lib/http')

const start = exports.start = () => {
  const db = createDb()
  const app = createApp({db})
  const server = createServer(app)
  return connectDb(db)
    .then(() => startServer(server))
    .then((server) => ({db, app, server}))
}

exports.stop = ({db, server, ...rest} = {}) => {
  return stopServer(server)
    .then(() => disconnectDb(db))
    .then(() => ({db, server, ...rest}))
}

if (require.main === module) start()
