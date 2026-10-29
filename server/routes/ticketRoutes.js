import { Router } from 'express';
import {
  listTickets, getTicket, createTicket, updateTicket, changeTicketStatus, deleteTicket,
} from '../controllers/ticketController.js';
import { ticketRules, ticketIdRule, ticketStatusRules } from '../validators/ticketValidators.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.route('/')
  .get(listTickets)
  .post(ticketRules(), validate, createTicket);

router.route('/:id')
  .get(ticketIdRule, validate, getTicket)
  .put(ticketIdRule, ticketRules(true), validate, updateTicket)
  .delete(ticketIdRule, validate, deleteTicket);

router.patch('/:id/status', ticketIdRule, ticketStatusRules, validate, changeTicketStatus);

export default router;
