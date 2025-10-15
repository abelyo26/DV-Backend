import { Router } from 'express';

import { deleteUploadFile, uploadImage } from '../controllers/images';
import { getMulterFileUpload } from '../middlewares';
import parseValidationResult from '../validators/errors.parser';
import { deleteUploadFileValidator } from '../validators/images.validator';

const router = Router();

router.post('/uploadImage', getMulterFileUpload(), uploadImage);
router.delete(
  '/deleteImage',
  deleteUploadFileValidator,
  parseValidationResult,
  deleteUploadFile,
);

export default router;
