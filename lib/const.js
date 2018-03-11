const path = require('path')

const NODE_ENV = process.env.NODE_ENV || 'development'
exports.PORT = process.env.PORT || 3000
exports.HOST = process.env.HOST || 'localhost'
const PUBLIC_DIR = (exports.PUBLIC_DIR =
  process.env.PUBLIC_DIR || path.resolve(__dirname, '..', 'public'))
exports.UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.resolve(PUBLIC_DIR, 'uploads')
exports.DB_URL = process.env.DB_URL || `mongodb://localhost/bizumie-${NODE_ENV}`
exports.ERR_NOT_FOUND = 'ERR_NOT_FOUND'
exports.ERR_NOT_IMPLEMENTED = 'ERR_NOT_IMPLEMENTED'
exports.ERR_REQUIRED = 'ERR_REQUIRED'
exports.ERR_UNSUPPORTED = 'ERR_UNSUPPORTED'
exports.JWT_SECRET = process.env.JWT_SECRET || 'secret'
