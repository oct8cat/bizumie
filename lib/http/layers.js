const createGraphQLHandler = require('express-graphql')
const createMultipartHandler = require('multer')
const {omit} = require('ramda')
const express = require('express')
const {exec, schema, requestStrings: {createUploadString}} = require('../graphql')
const {PUBLIC_DIR, ERR_UNSUPPORTED, ERR_REQUIRED, UPLOAD_DIR} = require('../const')

exports.createUploadLayer = (ctx) => {
  const handleMultipart = createMultipartHandler({dest: UPLOAD_DIR, fileFilter}).single('upload')
  return (req, res, next) => {
    handleMultipart(req, res, (error) => {
      if (error) return next(error)
      if (!req.file) return next(Object.assign(new Error(`${ERR_REQUIRED}: file`), {status: 400}))
      const input = omit(['destination', 'fieldname'], req.file)
      return exec(schema, createUploadString, {input}, ctx)
        .then(({data, errors}) => {
          if (errors) return Promise.reject(Object.assign(new Error(), {errors}))
          res.send(data.createUpload)
        })
        .catch(next)
    })
  }
}

exports.createGraphQLLayer = (ctx) => {
  const handleGraphQL = createGraphQLHandler({schema, graphiql: true})
  return (req, res, next) => {
    Object.assign(req, ctx)
    handleGraphQL(req, res, next)
  }
}

exports.createStaticLayer = (ctx) => {
  return express.static(PUBLIC_DIR)
}

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.match(/^image\//)) {
    return cb(Object.assign(new Error(`${ERR_UNSUPPORTED}: ${file.mimetype}`), {status: 400}))
  }
  return cb(null, true)
}
