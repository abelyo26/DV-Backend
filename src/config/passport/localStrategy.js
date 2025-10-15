import passportLocal from 'passport-local';

import User from '../../models/users';

const strategy = new passportLocal.Strategy(
  { passwordField: 'password', usernameField: 'email' },
  async (email, password, done) => {
    try {
      const authUser = await User.authenticateUser(email, password);
      return done(false, authUser);
    } catch (error) {
      return done(error, null);
    }
  },
);

export default strategy;
