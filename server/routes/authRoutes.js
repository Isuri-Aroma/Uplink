import { Router } from 'express';
import { body } from 'express-validator';
import { login, me } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
  '/login',
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Enter your password'),
  validate,
  login
);
router.get('/me', protect, me);

export default router;
