const {
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType
} = require('graphql')
const { db: { getUserModel } } = require('bizumie-common')

exports.Upload = new GraphQLObjectType({
  name: 'Upload',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (upload) => `/uploads/${upload.filename}`
    },
    originalName: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (upload) => upload.originalname
    },
    user: {
      type: User,
      resolve: (upload, args, { db }) =>
        !upload.user ? null : getUserModel(db).findById(upload.user)
    }
  })
})

const User = (exports.User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    displayName: { type: GraphQLString }
  })
}))

exports.Post = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    text: { type: GraphQLString },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    author: {
      type: User,
      resolve: (post, args, ctx) => {
        if (!post.author) return null
        const userModel = getUserModel(ctx.db)
        console.log(post.author)
        if (post.author instanceof userModel) return post.author
        return userModel.findById(post.author)
      }
    }
  })
})
