import { Router } from 'express';
import { body } from 'express-validator';
import { login, me, staffList } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
  '/login',
  body('email').isString().withMessage('Enter a valid email address').bail()
    .trim().isEmail().withMessage('Enter a valid email address'),
  body('password').isString().withMessage('Enter your password').bail()
    .notEmpty().withMessage('Enter your password'),
  validate,
  login
);
router.get('/me', protect, me);
router.get('/staff', protect, staffList);

export default router;
