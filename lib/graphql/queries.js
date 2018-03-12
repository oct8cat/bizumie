const { GraphQLList } = require('graphql')
const { User, Upload } = require('./types')
const { db: { getUploadModel } } = require('bizumie-common')

exports.me = {
  type: User,
  resolve: (parent, args, { user }) => user
}

exports.uploads = {
  type: new GraphQLList(Upload),
  resolve: (parent, args, { db }) => getUploadModel(db).find()
}
