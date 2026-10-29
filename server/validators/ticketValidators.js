import { body, param } from 'express-validator';
import { CATEGORIES, PRIORITIES, TICKET_STATUSES } from '../models/Ticket.js';

export const ticketIdRule = [param('id').isMongoId().withMessage('Invalid ticket id')];

export const ticketRules = (isUpdate = false) => {
  const field = (name, label) =>
    isUpdate ? body(name).optional() : body(name).exists({ values: 'falsy' }).withMessage(`${label} is required`).bail();

  return [
    ...(isUpdate ? [] : [field('subscription', 'Subscription').isMongoId().withMessage('Invalid subscription id')]),
    field('category', 'Category').isIn(CATEGORIES).withMessage('Choose a valid category'),
    body('priority').optional().isIn(PRIORITIES).withMessage('Priority must be one of: ' + PRIORITIES.join(', ')),
    field('subject', 'Subject').trim().isLength({ min: 5, max: 100 }).withMessage('Subject must be 5 to 100 characters'),
    field('description', 'Description').trim().isLength({ min: 10, max: 1000 })
      .withMessage('Description must be 10 to 1000 characters'),
    // null or "" unassigns the ticket
    body('assignedTo').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid staff member'),
    body('contactMobile').optional({ values: 'falsy' }).trim().customSanitizer((v) => String(v).replace(/[\s-]/g, ''))
      .matches(/^07\d{8}$/).withMessage('Contact number must look like 07XXXXXXXX'),
  ];
};

export const ticketStatusRules = [
  body('status').isIn(TICKET_STATUSES).withMessage('Status must be one of: ' + TICKET_STATUSES.join(', ')),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note must be 500 characters or less'),
];
