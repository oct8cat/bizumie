const { GraphQLList } = require('graphql')
const { Post } = require('../types')
const { db: { getPostModel } } = require('bizumie-common')

module.exports = {
  type: new GraphQLList(Post),
  resolve: (parent, args, { db }) =>
    getPostModel(db)
      .find()
      .populate('author')
}
