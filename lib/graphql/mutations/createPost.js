const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull
} = require('graphql')
const { db: { getPostModel } } = require('bizumie-common')
const { Post } = require('../types')

module.exports = {
  type: new GraphQLNonNull(
    new GraphQLObjectType({
      name: 'CreatePostPayload',
      fields: () => ({
        post: { type: new GraphQLNonNull(Post) }
      })
    })
  ),
  args: {
    input: {
      type: new GraphQLNonNull(
        new GraphQLInputObjectType({
          name: 'CreatePostInput',
          fields: () => ({
            title: { type: new GraphQLNonNull(GraphQLString) },
            text: { type: GraphQLString }
          })
        })
      )
    }
  },
  resolve: (parent, { input }, { db, user }) => {
    return getPostModel(db)
      .create({ author: user ? user.id : null, ...input })
      .then(
        (post) =>
          new Promise((resolve, reject) => {
            post.populate('author', (err, post) => {
              if (err) return reject(err)
              return resolve(post)
            })
          })
      )
      .then((post) => ({ post }))
  }
}
