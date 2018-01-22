const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('./const')

exports.generateUserToken = (user) => {
  return jwt.sign(user.id, JWT_SECRET)
}
