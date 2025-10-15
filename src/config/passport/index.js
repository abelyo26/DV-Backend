import jwtStrategy from './jwtStrategy';
import localStrategy from './localStrategy';

/**
 * This function initiates passport strategies
 * @param {object} passport - passport object
 * @returns {void}
 */
const initiatePassport = (passport) => {
  passport.use(localStrategy);
  passport.use(jwtStrategy);
};

export default initiatePassport;
