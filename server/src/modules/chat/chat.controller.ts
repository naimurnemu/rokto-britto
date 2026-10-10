import { RequestHandler } from 'express';
import { sendInitialMessage, getChatSession } from './chat.service';

/**
 * Functional RequestHandler: Send message with anti-spam check
 */
export const sendMessageHandler: RequestHandler = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const senderId = req.user?.id || req.body.senderId;
    const { message, senderType = 'DONOR' } = req.body;

    if (!message || message.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Message content cannot be empty.' },
      });
      return;
    }

    const result = await sendInitialMessage(sessionId, senderId, senderType, message);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code || 'CHAT_ERROR',
          message: error.message,
        },
      });
      return;
    }
    next(error);
  }
};

/**
 * Functional RequestHandler: Get chat session by ID
 */
export const getSessionHandler: RequestHandler = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await getChatSession(sessionId);
    res.json({ success: true, data: session });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};

// Compatibility export
export const chatController = {
  sendMessage: sendMessageHandler,
  getSession: getSessionHandler,
};
