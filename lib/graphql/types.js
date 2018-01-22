const {GraphQLInputObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLObjectType} = require('graphql')

const Upload = exports.Upload = new GraphQLObjectType({
  name: 'Upload',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID)},
    url: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (upload) => `/uploads/${upload.filename}`
    },
    originalName: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (upload) => upload.originalname
    }
  })
})

exports.CreateUploadInput = new GraphQLInputObjectType({
  name: 'CreateUploadInput',
  fields: () => ({
    encoding: {type: new GraphQLNonNull(GraphQLString)},
    filename: {type: new GraphQLNonNull(GraphQLString)},
    mimetype: {type: new GraphQLNonNull(GraphQLString)},
    originalname: {type: new GraphQLNonNull(GraphQLString)},
    path: {type: new GraphQLNonNull(GraphQLString)},
    size: {type: new GraphQLNonNull(GraphQLString)}
  })
})

exports.CreateUploadPayload = new GraphQLObjectType({
  name: 'CreateUploadPayload',
  fields: () => ({
    upload: {type: new GraphQLNonNull(Upload)}
  })
})

exports.User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID)},
    displayName: {type: GraphQLString}
  })
})
