import { Router } from 'express';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { userRules, userIdRule } from '../validators/userValidators.js';
import { validate } from '../middleware/validate.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

// Access Control is admin only
router.use(requireRole('admin'));

router.route('/')
  .get(listUsers)
  .post(userRules(), validate, createUser);

router.route('/:id')
  .get(userIdRule, validate, getUser)
  .put(userIdRule, userRules(true), validate, updateUser)
  .delete(userIdRule, validate, deleteUser);

export default router;
