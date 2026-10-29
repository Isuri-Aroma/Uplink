import { body, param } from 'express-validator';
import { ROLES } from '../models/User.js';

export const userIdRule = [param('id').isMongoId().withMessage('Invalid user id')];

export const userRules = (isUpdate = false) => {
  const field = (name, label) =>
    isUpdate ? body(name).optional() : body(name).exists({ values: 'falsy' }).withMessage(`${label} is required`).bail();

  return [
    field('name', 'Name').trim().isLength({ min: 3, max: 60 }).withMessage('Name must be 3 to 60 characters'),
    field('email', 'Email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
    field('password', 'Password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
      .matches(/\d/).withMessage('Password must contain a number'),
    body('role').optional().isIn(ROLES).withMessage('Role must be admin or agent'),
    body('isActive').optional().isBoolean().withMessage('isActive must be true or false').toBoolean(),
  ];
};
