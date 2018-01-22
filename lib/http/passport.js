const {Passport} = require('passport')
const {ExtractJwt: ExtractJWT, Strategy: JWTStrategy} = require('passport-jwt')
const {JWT_SECRET} = require('../const')
const {userModel} = require('../db')

exports.createPassport = (ctx) => {
  const passport = new Passport()

  passport.use(new JWTStrategy({
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
  }, (payload, next) => {
    return userModel(ctx.db)
      .findById(payload)
      .then((user) => next(null, user))
  }))

  return passport
}
