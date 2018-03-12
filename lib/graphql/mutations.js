const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull
} = require('graphql')
const { db: { getUploadModel } } = require('bizumie-common')
const { Upload } = require('./types')

exports.createUpload = {
  type: new GraphQLNonNull(
    new GraphQLObjectType({
      name: 'CreateUploadPayload',
      fields: () => ({
        upload: { type: new GraphQLNonNull(Upload) }
      })
    })
  ),
  args: {
    input: {
      type: new GraphQLNonNull(
        new GraphQLInputObjectType({
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
      )
    }
  },
  resolve: (parent, { input }, { db, user }) => {
    return getUploadModel(db)
      .create({ user: user ? user.id : null, ...input })
      .then((upload) => ({ upload }))
  }
}
