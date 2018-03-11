const {
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType
} = require('graphql')
const { userModel } = require('../db')

const Upload = (exports.Upload = new GraphQLObjectType({
  name: 'Upload',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: upload => `/uploads/${upload.filename}`
    },
    originalName: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: upload => upload.originalname
    },
    user: {
      type: User,
      resolve: (upload, args, { db }) =>
        !upload.user ? null : userModel(db).findById(upload.user)
    }
  })
}))

exports.CreateUploadInput = new GraphQLInputObjectType({
  name: 'CreateUploadInput',
  fields: () => ({
    encoding: { type: new GraphQLNonNull(GraphQLString) },
    filename: { type: new GraphQLNonNull(GraphQLString) },
    mimetype: { type: new GraphQLNonNull(GraphQLString) },
    originalname: { type: new GraphQLNonNull(GraphQLString) },
    path: { type: new GraphQLNonNull(GraphQLString) },
    size: { type: new GraphQLNonNull(GraphQLString) }
  })
})

exports.CreateUploadPayload = new GraphQLObjectType({
  name: 'CreateUploadPayload',
  fields: () => ({
    upload: { type: new GraphQLNonNull(Upload) }
  })
})

const User = (exports.User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    displayName: { type: GraphQLString }
  })
}))
