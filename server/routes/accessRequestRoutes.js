import { Router } from 'express';
import {
  approveRequest, createRequest, deleteRequest, listRequests, rejectRequest,
} from '../controllers/accessRequestController.js';
import {
  approveRules, newRequestRules, rejectRules, requestIdRule,
} from '../validators/accessRequestValidators.js';
import { validate } from '../middleware/validate.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: anyone can ask for access
router.post('/', newRequestRules, validate, createRequest);

// Admin only from here
router.use(protect, requireRole('admin'));
router.get('/', listRequests);
router.patch('/:id/approve', requestIdRule, approveRules, validate, approveRequest);
router.patch('/:id/reject', requestIdRule, rejectRules, validate, rejectRequest);
router.delete('/:id', requestIdRule, validate, deleteRequest);

export default router;
