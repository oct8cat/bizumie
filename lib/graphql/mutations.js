const {GraphQLNonNull} = require('graphql')
const {CreateUploadInput, CreateUploadPayload} = require('./types')
const {uploadModel} = require('../db')

exports.createUpload = {
  type: new GraphQLNonNull(CreateUploadPayload),
  args: {
    input: {type: new GraphQLNonNull(CreateUploadInput)}
  },
  resolve: (parent, {input}, {db}) => {
    return uploadModel(db)
      .create(input)
      .then((upload) => ({upload}))
  }
}
