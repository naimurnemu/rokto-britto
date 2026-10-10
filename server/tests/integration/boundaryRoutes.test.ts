/**
 * INTEGRATION TEST: Express API Boundary Value & Policy Endpoints
 * 
 * LEARNING NOTE:
 * In this integration test, we test the actual Express HTTP pipeline:
 * Routing -> Middleware -> Controller -> Business Service -> JSON Response.
 * 
 * We mock the Prisma Database layer so tests run in any environment (local, CI/CD)
 * without needing an active PostgreSQL connection.
 */

import request from 'supertest';

// Mock Prisma client methods on prisma.config before importing app
jest.mock('../../src/config/prisma.config', () => ({
  prisma: {
    bloodBank: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    report: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    chatSession: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    chatMessage: {
      create: jest.fn(),
    },
    bloodRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import app from '../../src/app';
import { prisma } from '../../src/config';

describe('Integration Tests: API Routes with Rokto Britto Policy Rules', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/blood-banks/register - 500 BDT Minimum Deposit Boundary', () => {
    it('Boundary Test (499 BDT): Should reject with HTTP 400 if initial deposit is less than 500 BDT', async () => {
      const response = await request(app)
        .post('/api/blood-banks/register')
        .send({
          name: 'Red Crescent Blood Center',
          licenseNumber: 'DH-BB-001',
          email: 'info@redcrescent.bd',
          phone: '+8801711111111',
          initialDepositAmount: 499.0, // 499 BDT -> Fails boundary condition
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_INITIAL_DEPOSIT');
      expect(response.body.error.message).toContain('Minimum initial deposit required is 500 BDT');
    });

    it('Boundary Test (500 BDT): Should succeed with HTTP 201 when initial deposit is 500 BDT', async () => {
      const mockBloodBank = {
        id: 'bb-uuid-1',
        name: 'Red Crescent Blood Center',
        licenseNumber: 'DH-BB-001',
        email: 'info@redcrescent.bd',
        phone: '+8801711111111',
        walletBalance: 500.0,
      };
      const mockTransaction = {
        id: 'tx-uuid-1',
        amount: 500.0,
        type: 'INITIAL_DEPOSIT',
      };

      (prisma.$transaction as jest.Mock).mockResolvedValueOnce({
        bloodBank: mockBloodBank,
        transaction: mockTransaction,
      });

      const response = await request(app)
        .post('/api/blood-banks/register')
        .send({
          name: 'Red Crescent Blood Center',
          licenseNumber: 'DH-BB-001',
          email: 'info@redcrescent.bd',
          phone: '+8801711111111',
          initialDepositAmount: 500.0, // Exactly 500 BDT -> Passes boundary condition
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Registration approved');
      expect(response.body.data.bloodBank.walletBalance).toBe(500.0);
    });
  });

  describe('POST /api/reports - Two-Strike Automated Ban Rule', () => {
    it('1st Report Boundary: User flagged with strike 1, account remains active', async () => {
      const mockUserWith0Strikes = {
        id: 'target-user-1',
        penaltyStrikes: 0,
        isBanned: false,
        isActive: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUserWith0Strikes);
      (prisma.$transaction as jest.Mock).mockResolvedValueOnce([
        { id: 'report-1' },
        { ...mockUserWith0Strikes, penaltyStrikes: 1 },
      ]);

      const response = await request(app)
        .post('/api/reports')
        .send({
          reporterId: 'reporter-1',
          targetUserId: 'target-user-1',
          reason: 'Did not show up after promising blood',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.policyResult.actionTaken).toBe('FLAGGED');
      expect(response.body.data.userCurrentStatus.penaltyStrikes).toBe(1);
      expect(response.body.data.userCurrentStatus.isBanned).toBe(false);
    });

    it('2nd Report Boundary: User reaches 2 strikes, automated ban triggered immediately', async () => {
      const mockUserWith1Strike = {
        id: 'target-user-2',
        penaltyStrikes: 1, // Already has 1 strike
        isBanned: false,
        isActive: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUserWith1Strike);
      (prisma.$transaction as jest.Mock).mockResolvedValueOnce([
        { id: 'report-2' },
        { ...mockUserWith1Strike, penaltyStrikes: 2, isBanned: true, isActive: false },
      ]);

      const response = await request(app)
        .post('/api/reports')
        .send({
          reporterId: 'reporter-2',
          targetUserId: 'target-user-2',
          reason: 'Demanding payment for free blood donation',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.policyResult.actionTaken).toBe('BANNED');
      expect(response.body.data.userCurrentStatus.penaltyStrikes).toBe(2);
      expect(response.body.data.userCurrentStatus.isBanned).toBe(true);
    });
  });

  describe('POST /api/chats/:sessionId/messages - Anti-Spam 1-Message Rule', () => {
    it('Attempted 2nd Message (API attempt): Returns HTTP 403 Forbidden with ANTI_SPAM_VIOLATION', async () => {
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'session-999',
        donorId: 'donor-1',
        requesterId: 'requester-1',
        isFirstMessageSent: true, // Already sent!
        scheduledTime: new Date(),
      });

      const response = await request(app)
        .post('/api/chats/session-999/messages')
        .send({
          senderId: 'donor-1',
          senderType: 'DONOR',
          message: 'Can I also bring my friend?',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ANTI_SPAM_VIOLATION');
      expect(response.body.error.message).toContain('Anti-Spam Protocol: You have already sent your initial message');
    });
  });
});
