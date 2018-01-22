const {graphql, GraphQLSchema, GraphQLObjectType} = require('graphql')
const {uploads, me} = require('./queries')
const {createUpload} = require('./mutations')

const Query = exports.Query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    me,
    uploads
  })
})

const Mutation = exports.Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createUpload
  })
})

exports.schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
})

exports.exec = (schema, requestString, variables = {}, ctx = {}) => {
  return graphql(schema, requestString, null, ctx, variables)
}

exports.requestStrings = require('./requestStrings')
