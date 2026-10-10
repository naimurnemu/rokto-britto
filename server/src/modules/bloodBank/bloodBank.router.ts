import { Router } from 'express';
import {
  registerBloodBankHandler,
  sendOutreachHandler,
  getDetailsHandler,
  listAllHandler,
  createSubagentHandler,
  listSubagentsHandler,
  loginAgencyHandler,
} from './bloodBank.controller';

const router = Router();

// GET /api/blood-banks - List all blood banks
router.get('/', listAllHandler);

// POST /api/blood-banks/login - Agency and Subagent sign in
router.post('/login', loginAgencyHandler);

// POST /api/blood-banks/register - Public agency registration application
router.post('/register', registerBloodBankHandler);

// Subagent management (restricted to Agency side)
router.post('/:agencyId/subagents', createSubagentHandler);
router.get('/:agencyId/subagents', listSubagentsHandler);

// GET /api/blood-banks/:bloodBankId - Blood bank details and ledger
router.get('/:bloodBankId', getDetailsHandler);

// POST /api/blood-banks/:bloodBankId/outreach - Send outreach message (5 BDT fee)
router.post('/:bloodBankId/outreach', sendOutreachHandler);

export const bloodBankRouter = router;
export default bloodBankRouter;
