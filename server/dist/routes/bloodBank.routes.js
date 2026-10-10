"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bloodBank_controller_1 = require("../controllers/bloodBank.controller");
const router = (0, express_1.Router)();
// GET /api/blood-banks - List all blood banks
router.get('/', bloodBank_controller_1.listAllBloodBanks);
// POST /api/blood-banks/register - Register blood bank (validates >= 500 BDT initial deposit)
router.post('/register', bloodBank_controller_1.registerBloodBank);
// GET /api/blood-banks/:bloodBankId - Get blood bank profile, ledger, and reviews
router.get('/:bloodBankId', bloodBank_controller_1.getBloodBankDetails);
// POST /api/blood-banks/:bloodBankId/outreach - Blood bank reaches out to requester (deducts 5 BDT fee atomically)
router.post('/:bloodBankId/outreach', bloodBank_controller_1.sendOutreachMessage);
exports.default = router;
