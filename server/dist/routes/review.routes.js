"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const router = (0, express_1.Router)();
// POST /api/reviews - Submit verified review for a blood bank
router.post('/', review_controller_1.submitVerifiedReview);
exports.default = router;
