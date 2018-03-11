const { GraphQLList } = require('graphql')
const { User, Upload } = require('./types')
const { uploadModel } = require('../db')

exports.me = {
  type: User,
  resolve: (parent, args, { user }) => user
}

exports.uploads = {
  type: new GraphQLList(Upload),
  resolve: (parent, args, { db }) => uploadModel(db).find()
}
