import passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
    user: object; // Change this to the actual type of your user object
}

const params = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || ""
}

passport.use(
    new Strategy(params, async (jwt_payload: JwtPayload, done) => {
        console.log(jwt_payload)
        if (jwt_payload.user) {
            return done(null, jwt_payload.user)
        }
        return done(null, false)
    })
);