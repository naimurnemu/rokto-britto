"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const request_controller_1 = require("../controllers/request.controller");
const router = (0, express_1.Router)();
// POST /api/requests - Create emergency blood request & notify nearby 20km donors
router.post('/', request_controller_1.createBloodRequest);
// GET /api/requests/nearby - Query active requests within 20km radius (or specified lat/lng/radius)
router.get('/nearby', request_controller_1.getNearbyRequests);
// GET /api/requests/:id - Get specific blood request details & active chats
router.get('/:id', request_controller_1.getRequestById);
// PATCH /api/requests/:id/complete - Mark blood request as COMPLETED once blood is found
router.patch('/:id/complete', request_controller_1.markRequestCompleted);
exports.default = router;
