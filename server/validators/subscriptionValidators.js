import { body, param } from 'express-validator';
import { DISTRICTS } from '../utils/districts.js';
import { STATUSES } from '../models/Subscription.js';

export const subscriptionIdRule = [param('id').isMongoId().withMessage('Invalid subscription id')];

const optionalFields = [
  body('installAddress.line1').optional().trim().notEmpty().withMessage('Installation address cannot be empty')
    .isLength({ max: 120 }).withMessage('Address must be 120 characters or less'),
  body('installAddress.city').optional().trim().notEmpty().withMessage('City cannot be empty')
    .isLength({ max: 60 }).withMessage('City must be 60 characters or less'),
  body('installAddress.district').optional().isIn(DISTRICTS).withMessage('Choose one of the 25 districts'),
  body('routerSerial').optional({ values: 'falsy' }).trim().toUpperCase()
    .matches(/^[A-Z0-9-]{6,30}$/).withMessage('Router serial must be 6-30 letters, numbers or dashes'),
  body('installDate').optional({ values: 'falsy' }).isISO8601().withMessage('Install date is not a valid date')
    .custom((d) => new Date(d) <= new Date()).withMessage('Install date cannot be in the future'),
  body('usedGB').optional().isFloat({ min: 0 }).withMessage('Data used must be 0 or more').toFloat(),
  body('notes').optional().trim().isLength({ max: 300 }).withMessage('Notes must be 300 characters or less'),
];

export const createSubscriptionRules = [
  body('customer').exists({ values: 'falsy' }).withMessage('Customer is required').bail()
    .isMongoId().withMessage('Invalid customer id'),
  body('plan').exists({ values: 'falsy' }).withMessage('Plan is required').bail()
    .isMongoId().withMessage('Invalid plan id'),
  ...optionalFields,
];

export const updateSubscriptionRules = [
  body('plan').optional().isMongoId().withMessage('Invalid plan id'),
  ...optionalFields,
];

export const statusRules = [
  body('status').isIn(STATUSES).withMessage('Status must be one of: ' + STATUSES.join(', ')),
  body('note').optional().trim().isLength({ max: 200 }).withMessage('Note must be 200 characters or less'),
];
