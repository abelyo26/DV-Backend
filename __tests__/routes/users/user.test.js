import chai from 'chai';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

import {
  duplicateEmailUser,
  missingFirstNameUser,
  validNewUser,
  wrongEmailTypeUser,
} from './data';

import connectToDb from '../../../src/config/mongoose';
import app from '../../../src/index';
import Users from '../../../src/models/users';

chai.use(require('chai-http'));

const { request, expect } = chai;

describe('User Routes Test', function () {
  before(function (done) {
    connectToDb().then(() => {
      done();
    });
  });

  describe('# [POST] /api/user/create', function () {
    it('Should create a user and assign a token given a valid user body', async function () {
      const response = await request(app)
        .post('/api/user/create')
        .send(validNewUser);

      expect(response).to.have.status(httpStatus.OK);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('token');
    });

    it('Should return a status of 409 [Conflict] when an existing E-mail is used to sign up', async function () {
      const response = await request(app)
        .post('/api/user/create')
        .send(duplicateEmailUser);
      expect(response).to.have.status(httpStatus.CONFLICT);
    });

    it('Should return a status of 400 [BAD REQUEST] when email type is invalid', async function () {
      const response = await request(app)
        .post('/api/user/create')
        .send(wrongEmailTypeUser);
      expect(response).to.have.status(httpStatus.BAD_REQUEST);
    });

    it('Should return a status of 400 [BAD REQUEST] when email first name is not provided', async function () {
      const response = await request(app)
        .post('/api/user/create')
        .send(missingFirstNameUser);
      expect(response).to.have.status(httpStatus.BAD_REQUEST);
    });
  });

  after(function (done) {
    // Clean up test data for next run
    Users.deleteMany({ email: validNewUser.email })
      .exec()
      .then(() => {
        mongoose.connection.close();
        done();
      })
      .catch((err) => {
        throw err;
      });
  });
});
