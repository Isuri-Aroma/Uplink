import { body, param } from 'express-validator';
import { TEAMS } from '../models/AccessRequest.js';

export const requestIdRule = [param('id').isMongoId().withMessage('Invalid request id')];

const required = (name, label) => body(name).exists({ values: 'falsy' }).withMessage(`${label} is required`).bail();

export const newRequestRules = [
  required('name', 'Full name').trim().isLength({ min: 3, max: 60 }).withMessage('Name must be 3 to 60 characters'),
  required('email', 'Work email').trim().toLowerCase()
    .matches(/^[^\s@]+@uplink\.lk$/).withMessage('Use your @uplink.lk work email'),
  required('employeeId', 'Employee ID').trim().toUpperCase()
    .matches(/^UPL-\d{4}$/).withMessage('Employee ID looks like UPL-1043'),
  required('team', 'Team').isIn(TEAMS).withMessage('Choose your team'),
  required('password', 'Password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/\d/).withMessage('Password must contain a number'),
  body('reason').optional().trim().isLength({ max: 300 }).withMessage('Reason must be 300 characters or less'),
];

export const approveRules = [body('role').optional().isIn(['admin', 'agent']).withMessage('Role must be admin or agent')];

export const rejectRules = [
  required('reason', 'Reason').trim().isLength({ max: 200 }).withMessage('Reason must be 200 characters or less'),
];
