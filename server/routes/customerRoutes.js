import { Router } from 'express';
import {
  listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer,
} from '../controllers/customerController.js';
import { customerRules, customerIdRule } from '../validators/customerValidators.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.route('/')
  .get(listCustomers)
  .post(customerRules(), validate, createCustomer);

router.route('/:id')
  .get(customerIdRule, validate, getCustomer)
  .put(customerIdRule, customerRules(true), validate, updateCustomer)
  .delete(customerIdRule, validate, deleteCustomer);

export default router;
