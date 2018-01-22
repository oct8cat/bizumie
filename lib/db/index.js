const {Mongoose} = Object.assign(require('mongoose'), {Promise})
const {DB_URL} = require('../const')

exports.createDb = () => {
  const db = new Mongoose()

  const uploadSchema = new db.Schema({
    encoding: {type: 'String', required: true},
    filename: {type: 'String', required: true},
    mimetype: {type: 'String', required: true},
    originalname: {type: 'String', required: true},
    size: {type: 'String', required: true},
    user: {type: 'ObjectId'}
  })

  const userSchema = new db.Schema({
    displayName: {type: 'String'}
  })

  db.model('Upload', uploadSchema)
  db.model('User', userSchema)

  return db
}

exports.connectDb = (db, {url = DB_URL} = {}) => {
  return db.connect(url).then(() => db)
}

exports.disconnectDb = (db) => {
  return db.disconnect().then(() => db)
}

exports.clearDb = (db) => {
  return Promise.all([
    uploadModel(db).remove({})
  ])
}

const model = exports.model = (name) => (db) => {
  return db.model(name)
}

const uploadModel = exports.uploadModel = model('Upload')

exports.userModel = model('User')
