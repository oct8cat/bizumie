const express = require('express')
const { Passport } = require('passport')
const {
  env: { getEnvJWTSecret },
  error: { errUnsupported, errRequired },
  db: { getUserModel }
} = require('bizumie-common')
const { getEnvUploadDir, getEnvPublicDir } = require('./env')
const {
  ExtractJwt: ExtractJWT,
  Strategy: JWTStrategy
} = require('passport-jwt')
const createGraphQLHandler = require('express-graphql')
const { omit } = require('ramda')
const cors = require('cors')
const createMultipartHandler = require('multer')
const { exec, schema, rs: { createUploadString } } = require('./graphql')

exports.createApp = (ctx) => {
  const { db } = ctx
  const app = express()
  const passport = createPassport({ db })

  app.use(express.static(getEnvPublicDir()))
  app.use(cors())
  app.use(createJWTAuthLayer({ passport }))
  app.post('/upload', createUploadLayer({ ctx }))
  app.use('/graphql', createGraphQLLayer({ ctx }))
  app.use(handleError)

  return app
}

const createJWTAuthLayer = ({ passport }) => {
  const handleJWTAuth = passport.authenticate('jwt', { session: false })
  return (req, res, next) => {
    if (!req.headers['authorization']) return next()
    return handleJWTAuth(req, res, next)
  }
}

const createUploadLayer = ({ ctx }) => {
  const handleMultipart = createMultipartHandler({
    dest: getEnvUploadDir(),
    fileFilter
  }).single('upload')
  return (req, res, next) => {
    handleMultipart(req, res, (error) => {
      if (error) return next(error)
      if (!req.file) {
        return next(Object.assign(errRequired('file'), { status: 400 }))
      }
      const input = omit(['destination', 'fieldname'], req.file)
      return exec(
        schema,
        createUploadString,
        { input },
        Object.assign(req, ctx)
      )
        .then(({ data, errors }) => {
          if (errors) {
            return Promise.reject(Object.assign(new Error(), { errors }))
          }
          res.send(data.createUpload)
        })
        .catch(next)
    })
  }
}

const createGraphQLLayer = ({ ctx }) => {
  const handleGraphQL = createGraphQLHandler({ schema, graphiql: true })
  return (req, res, next) => {
    handleGraphQL(Object.assign(req, ctx), res, next)
  }
}

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.match(/^image\//)) {
    return cb(Object.assign(errUnsupported(file.mimetype), { status: 400 }))
  }
  return cb(null, true)
}

const createPassport = ({ db }) => {
  const passport = new Passport()

  passport.use(
    new JWTStrategy(
      {
        secretOrKey: getEnvJWTSecret(),
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
      },
      (payload, next) => {
        return getUserModel(db)
          .findById(payload)
          .then((user) => next(null, user))
      }
    )
  )

  return passport
}

const handleError = (error, req, res, next) => {
  error = error.errors[0] || error
  res.status(500).send(error)
}
