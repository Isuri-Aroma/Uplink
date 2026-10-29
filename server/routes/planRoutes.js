import { Router } from 'express';
import { listPlans, getPlan, createPlan, updatePlan, deletePlan } from '../controllers/planController.js';
import { planRules, planIdRule } from '../validators/planValidators.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.route('/')
  .get(listPlans)
  .post(planRules(), validate, createPlan);

router.route('/:id')
  .get(planIdRule, validate, getPlan)
  .put(planIdRule, planRules(true), validate, updatePlan)
  .delete(planIdRule, validate, deletePlan);

export default router;
