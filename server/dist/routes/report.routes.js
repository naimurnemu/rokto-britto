"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const router = (0, express_1.Router)();
// POST /api/reports - Report an abusive or fake user (triggers automated 2-strike ban policy)
router.post('/', report_controller_1.submitUserReport);
// GET /api/reports/:userId - Get report history for a target user
router.get('/:userId', report_controller_1.getUserReportHistory);
exports.default = router;
