const { graphql } = require('graphql')

const exec = (schema, rs, variables = {}, ctx = {}) => {
  return graphql(schema, rs, null, ctx, variables)
}

module.exports = {
  schema: require('./schema'),
  rs: require('./rs'),
  exec
}
