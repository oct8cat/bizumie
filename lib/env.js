const { resolve: resolvePath } = require('path')

exports.getPublicDir = () =>
  process.env.PUBLIC_DIR || resolvePath(__dirname, '..', 'public')

exports.getUploadDir = () =>
  process.env.UPLOAD_DIR || resolvePath(exports.getPublicDir(), 'uploads')
