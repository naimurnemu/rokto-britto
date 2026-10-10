"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const request_routes_1 = __importDefault(require("./request.routes"));
const donor_routes_1 = __importDefault(require("./donor.routes"));
const chat_routes_1 = __importDefault(require("./chat.routes"));
const bloodBank_routes_1 = __importDefault(require("./bloodBank.routes"));
const report_routes_1 = __importDefault(require("./report.routes"));
const review_routes_1 = __importDefault(require("./review.routes"));
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Rokto Britto API',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});
// Mount module routes
router.use('/auth', auth_routes_1.default);
router.use('/requests', request_routes_1.default);
router.use('/donors', donor_routes_1.default);
router.use('/chats', chat_routes_1.default);
router.use('/blood-banks', bloodBank_routes_1.default);
router.use('/reports', report_routes_1.default);
router.use('/reviews', review_routes_1.default);
exports.default = router;
