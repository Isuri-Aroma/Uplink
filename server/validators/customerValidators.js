import { body, param } from 'express-validator';
import { DISTRICTS } from '../utils/districts.js';
import { CUSTOMER_TYPES } from '../models/Customer.js';
import { parseNic, ageOn } from '../utils/nic.js';

export const customerIdRule = [param('id').isMongoId().withMessage('Invalid customer id')];

// e.g. "W. M. S. Bandara" or "W. A. de Silva"
const INITIALS = /^(?:[A-Z]\.\s?)+(?:de\s)?[A-Z][A-Za-z'-]+(?:\s[A-Z][A-Za-z'-]+)*$/;

export const customerRules = (isUpdate = false) => {
  const field = (name, label) =>
    isUpdate ? body(name).optional() : body(name).exists({ values: 'falsy' }).withMessage(`${label} is required`).bail();

  return [
    field('nameWithInitials', 'Name with initials').trim()
      .matches(INITIALS).withMessage('Name with initials should look like "W. M. S. Bandara"'),
    field('fullName', 'Full name').trim()
      .isLength({ min: 3, max: 120 }).withMessage('Full name must be 3 to 120 characters')
      .matches(/^[A-Za-z .'-]+$/).withMessage('Full name can only contain letters, spaces, dots and hyphens'),
    field('nic', 'NIC number').trim().toUpperCase()
      .custom((nic) => {
        const parsed = parseNic(nic);
        if (!parsed) throw new Error('NIC must be 9 digits + V/X (old) or 12 digits (new), with a valid birth day');
        const age = ageOn(parsed.dateOfBirth);
        if (age < 18) throw new Error('Customer must be at least 18 years old (from NIC birth date)');
        if (age > 120) throw new Error('NIC birth year is not realistic');
        return true;
      }),
    field('mobile', 'Mobile number').trim().customSanitizer((v) => String(v).replace(/[\s-]/g, ''))
      .matches(/^07\d{8}$/).withMessage('Mobile number must look like 07XXXXXXXX'),
    body('email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Email address is not valid'),
    field('address.line1', 'Address').trim().isLength({ max: 120 }).withMessage('Address must be 120 characters or less'),
    field('address.city', 'City').trim().isLength({ max: 60 }).withMessage('City must be 60 characters or less'),
    field('address.district', 'District').isIn(DISTRICTS).withMessage('Choose one of the 25 districts'),
    body('customerType').optional().isIn(CUSTOMER_TYPES).withMessage('Customer type must be Residential or Business'),
  ];
};
