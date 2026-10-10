"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const donor_controller_1 = require("../controllers/donor.controller");
const router = (0, express_1.Router)();
// POST /api/donors/schedule - Donor accepts request and commits to a time schedule
router.post('/schedule', donor_controller_1.acceptRequestAndSchedule);
// PATCH /api/donors/availability - Toggle donor active availability
router.patch('/availability', donor_controller_1.updateDonorAvailability);
exports.default = router;
