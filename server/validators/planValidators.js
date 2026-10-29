import { body, param } from 'express-validator';
import { TECHNOLOGIES } from '../models/Plan.js';

export const planIdRule = [param('id').isMongoId().withMessage('Invalid plan id')];

// isUpdate makes fields optional
export const planRules = (isUpdate = false) => {
  // Required on create, optional on update
  const field = (name, label) =>
    isUpdate ? body(name).optional() : body(name).exists({ values: 'null' }).withMessage(`${label} is required`).bail();

  return [
    field('name', 'Plan name').trim().notEmpty().withMessage('Plan name is required')
      .isLength({ max: 60 }).withMessage('Plan name must be 60 characters or less'),
    field('technology', 'Technology').isIn(TECHNOLOGIES).withMessage('Technology must be one of: ' + TECHNOLOGIES.join(', ')),
    field('downMbps', 'Download speed').isFloat({ min: 1, max: 10000 }).withMessage('Download speed must be between 1 and 10,000 Mbps').toFloat(),
    field('upMbps', 'Upload speed').isFloat({ min: 1 }).withMessage('Upload speed must be at least 1 Mbps').toFloat()
      .custom((up, { req }) => req.body.downMbps == null || up <= Number(req.body.downMbps))
      .withMessage('Upload speed cannot be higher than download speed'),
    body('dataCapGB').optional().isFloat({ min: 0 }).withMessage('Data cap must be 0 (unlimited) or more').toFloat(),
    field('monthlyFeeLKR', 'Monthly fee').isFloat({ min: 0 }).withMessage('Monthly fee must be 0 or more').toFloat(),
    body('description').optional().trim().isLength({ max: 300 }).withMessage('Description must be 300 characters or less'),
    body('isActive').optional().isBoolean().withMessage('isActive must be true or false').toBoolean(),
  ];
};
