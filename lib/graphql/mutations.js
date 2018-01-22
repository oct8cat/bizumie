const {GraphQLNonNull} = require('graphql')
const {CreateUploadInput, CreateUploadPayload} = require('./types')
const {uploadModel} = require('../db')

exports.createUpload = {
  type: new GraphQLNonNull(CreateUploadPayload),
  args: {
    input: {type: new GraphQLNonNull(CreateUploadInput)}
  },
  resolve: (parent, {input}, {db, user}) => {
    return uploadModel(db)
      .create({user: user ? user.id : null, ...input})
      .then((upload) => ({upload}))
  }
}
