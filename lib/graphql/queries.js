const {GraphQLList, GraphQLNonNull} = require('graphql')
const {Viewer, Upload} = require('./types')
const {uploadModel} = require('../db')

exports.viewer = {
  type: new GraphQLNonNull(Viewer),
  resolve: () => ({})
}

exports.uploads = {
  type: new GraphQLList(Upload),
  resolve: (parent, args, {db}) => uploadModel(db).find()
}
