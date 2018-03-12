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
