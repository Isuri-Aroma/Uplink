import { Router } from 'express';
import {
  listSubscriptions, getSubscription, createSubscription, updateSubscription, changeStatus, deleteSubscription,
} from '../controllers/subscriptionController.js';
import {
  subscriptionIdRule, createSubscriptionRules, updateSubscriptionRules, statusRules,
} from '../validators/subscriptionValidators.js';
import { validate } from '../middleware/validate.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.route('/')
  .get(listSubscriptions)
  .post(createSubscriptionRules, validate, createSubscription);

router.route('/:id')
  .get(subscriptionIdRule, validate, getSubscription)
  .put(subscriptionIdRule, updateSubscriptionRules, validate, updateSubscription)
  .delete(requireRole('admin'), subscriptionIdRule, validate, deleteSubscription);

router.patch('/:id/status', subscriptionIdRule, statusRules, validate, changeStatus);

export default router;
