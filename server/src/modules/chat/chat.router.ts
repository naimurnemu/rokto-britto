import { Router } from 'express';
import { sendMessageHandler, getSessionHandler } from './chat.controller';

const router = Router();

// GET /api/chats/:sessionId - Direct functional handler
router.get('/:sessionId', getSessionHandler);

// POST /api/chats/:sessionId/messages - Direct functional handler
router.post('/:sessionId/messages', sendMessageHandler);

export const chatRouter = router;
export default chatRouter;
