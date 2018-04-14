const { resolve: resolvePath } = require('path')
const { env: { getEnvVar } } = require('bizumie-common')

const getEnvPublicDir = () =>
  getEnvVar('PUBLIC_DIR', resolvePath(__dirname, '..', 'public'))

const getEnvUploadDir = () =>
  getEnvVar('UPLOAD_DIR', resolvePath(getEnvPublicDir(), 'uploads'))

module.exports = {
  getEnvPublicDir,
  getEnvUploadDir
}
