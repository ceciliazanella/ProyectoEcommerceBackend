import passport from "passport";
import passportJWT from "passport-jwt";
import UserModel from "../models/user.model.js";

const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new passportJWT.Strategy(
    {
      jwtFromRequest: ExtractJWT.fromExtractors([(req) => req.cookies.jwt]),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        const user = await UserModel.findById(jwt_payload.id).populate("cart");
        if (!user) {
          return done(null, false, {
            message: "Este Usuario no se encuentra...",
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

const initializePassport = () => {
  passport.initialize();
};

export default initializePassport;
