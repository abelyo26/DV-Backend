import { Router } from 'express';

import {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplications,
  searchApplication,
  updateApplication,
  verifyApplicationPayment,
} from '../controllers/applications';
import { authenticateJwt } from '../middlewares';
import {
  idValidator,
  postApplicationValidator,
  searchApplicationValidator,
  updateApplicationValidator,
} from '../validators/application.validator';
import { paginationValidator } from '../validators/common.validator';
import parseValidationResult from '../validators/errors.parser';

const router = Router();

router.post(
  '/',
  postApplicationValidator,
  parseValidationResult,
  createApplication,
);
router.get(
  '/',
  authenticateJwt,
  paginationValidator,
  parseValidationResult,
  getApplications,
);
router.get(
  '/search',
  searchApplicationValidator,
  parseValidationResult,
  searchApplication,
);
router.get(
  '/:id',
  authenticateJwt,
  idValidator,
  parseValidationResult,
  getApplicationById,
);
router.put(
  '/:id',
  authenticateJwt,
  updateApplicationValidator,
  parseValidationResult,
  updateApplication,
);
router.put(
  '/verify-payment/:id',
  authenticateJwt,
  idValidator,
  parseValidationResult,
  verifyApplicationPayment,
);
router.delete(
  '/:id',
  authenticateJwt,
  idValidator,
  parseValidationResult,
  deleteApplication,
);

export default router;
