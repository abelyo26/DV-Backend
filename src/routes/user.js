import express from 'express';

import {
  activateAccount,
  createUserController,
  getSupportUserList,
  getTokenOwner,
  loginController,
  logoutController,
} from '../controllers/user';
import { authenticateJwt } from '../middlewares';
import parseValidationResult from '../validators/errors.parser';
import {
  createUserValidator,
  loginValidator,
  validateAccountActivate,
} from '../validators/user.validator';

const router = express.Router();

router.post(
  '/create',
  createUserValidator(),
  parseValidationResult,
  createUserController,
);

router.post('/login', loginValidator(), parseValidationResult, loginController);
router.post('/logout', authenticateJwt, logoutController);

router.get('/account', authenticateJwt, getTokenOwner);
router.get('/check-login', authenticateJwt, getTokenOwner);

router.post(
  '/activate-account',
  validateAccountActivate(),
  parseValidationResult,
  activateAccount,
);

router.get('/supports', authenticateJwt, getSupportUserList);

export default router;
