const { User } = require('../types')

module.exports = {
  type: User,
  resolve: (parent, args, { user }) => user
}
