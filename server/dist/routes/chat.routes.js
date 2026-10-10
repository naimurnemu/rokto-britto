"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const router = (0, express_1.Router)();
// GET /api/chats/:sessionId - Fetch chat session history
router.get('/:sessionId', chat_controller_1.getChatSession);
// POST /api/chats/:sessionId/messages - Send message (strictly enforces 1-message rule for initial contact)
router.post('/:sessionId/messages', chat_controller_1.sendInitialChatMessage);
exports.default = router;
