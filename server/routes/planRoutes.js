import { Router } from 'express';
import { listPlans, getPlan, createPlan, updatePlan, deletePlan } from '../controllers/planController.js';
import { planRules, planIdRule } from '../validators/planValidators.js';
import { validate } from '../middleware/validate.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.route('/')
  .get(listPlans)
  .post(requireRole('admin'), planRules(), validate, createPlan); // only admins change the catalogue

router.route('/:id')
  .get(planIdRule, validate, getPlan)
  .put(requireRole('admin'), planIdRule, planRules(true), validate, updatePlan)
  .delete(requireRole('admin'), planIdRule, validate, deletePlan);

export default router;
