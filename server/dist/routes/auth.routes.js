"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// POST /api/auth/login - Register or Login via phone
router.post('/login', auth_controller_1.registerOrLoginUser);
// GET /api/auth/profile - Fetch authenticated user profile
router.get('/profile', auth_1.requireAuth, auth_controller_1.getProfile);
exports.default = router;
