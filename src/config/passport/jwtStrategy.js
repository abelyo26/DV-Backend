import httpStatus from 'http-status';
import { ExtractJwt, Strategy } from 'passport-jwt';

import APIError from '../../errors/APIError';
import User from '../../models/users';
import { jwtKey } from '../environments';

const strategy = new Strategy(
  {
    jwtFromRequest: (req) => req.cookies['token'],
    secretOrKey: jwtKey,
  },
  async (payload, done) => {
    try {
      const user = await User.findOne({ _id: payload._id });
      if (!user) {
        const NotFound = new APIError(
          'User not found',
          httpStatus.NOT_FOUND,
          true,
        );

        return done(NotFound, false);
      }

      return done(false, user);
    } catch (error) {
      return done(error, null);
    }
  },
);

export default strategy;
