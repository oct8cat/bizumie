const { GraphQLList } = require('graphql')
const { Upload } = require('../types')
const { db: { getUploadModel } } = require('bizumie-common')

module.exports = {
  type: new GraphQLList(Upload),
  resolve: (parent, args, { db }) => getUploadModel(db).find()
}
