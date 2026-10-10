"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBloodBank = registerBloodBank;
exports.sendOutreachMessage = sendOutreachMessage;
exports.getBloodBankDetails = getBloodBankDetails;
exports.listAllBloodBanks = listAllBloodBanks;
const prisma_1 = require("../config/prisma");
const wallet_service_1 = require("../services/wallet.service");
const socket_1 = require("../socket");
async function registerBloodBank(req, res) {
    try {
        const { name, licenseNumber, email, phone, address, latitude, longitude, initialDepositAmount, } = req.body;
        if (!name || !licenseNumber || !email || !phone || initialDepositAmount === undefined) {
            return res.status(400).json({
                success: false,
                error: { message: 'Name, License Number, Email, Phone, and Initial Deposit Amount are required.' },
            });
        }
        // Boundary check: 500 BDT minimum requirement
        const depositEval = (0, wallet_service_1.evaluateInitialDeposit)(Number(initialDepositAmount));
        if (!depositEval.approved) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INSUFFICIENT_INITIAL_DEPOSIT',
                    message: depositEval.message,
                },
            });
        }
        // Create Blood Bank & initial deposit transaction atomically
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const bloodBank = await tx.bloodBank.create({
                data: {
                    name,
                    licenseNumber,
                    email,
                    phone,
                    address: address || 'Dhaka, Bangladesh',
                    latitude: Number(latitude ?? 23.8103),
                    longitude: Number(longitude ?? 90.4125),
                    walletBalance: depositEval.walletBalance,
                    ratingScore: 5.0,
                    isApproved: true,
                },
            });
            const transaction = await tx.transaction.create({
                data: {
                    bloodBankId: bloodBank.id,
                    amount: Number(initialDepositAmount),
                    type: 'INITIAL_DEPOSIT',
                    description: `Initial registration deposit of ${initialDepositAmount} BDT`,
                    status: 'COMPLETED',
                },
            });
            return { bloodBank, transaction };
        });
        return res.status(201).json({
            success: true,
            message: depositEval.message,
            data: result,
        });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                error: { message: 'A blood bank with this license number or email already exists.' },
            });
        }
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Error registering blood bank.' },
        });
    }
}
async function sendOutreachMessage(req, res) {
    try {
        const { bloodBankId } = req.params;
        const { requestId, message } = req.body;
        if (!requestId || !message) {
            return res.status(400).json({
                success: false,
                error: { message: 'Request ID and outreach message content are required.' },
            });
        }
        const bloodBank = await prisma_1.prisma.bloodBank.findUnique({
            where: { id: bloodBankId },
        });
        if (!bloodBank) {
            return res.status(404).json({
                success: false,
                error: { message: 'Blood Bank not found.' },
            });
        }
        // Check balance and deduct 5 BDT outreach fee
        const feeEval = (0, wallet_service_1.deductOutreachFee)(bloodBank.walletBalance);
        if (!feeEval.success) {
            return res.status(402).json({
                success: false,
                error: {
                    code: 'INSUFFICIENT_FUNDS',
                    message: feeEval.error,
                    currentBalance: bloodBank.walletBalance,
                    requiredFee: wallet_service_1.OUTREACH_MESSAGE_FEE,
                },
            });
        }
        const targetRequest = await prisma_1.prisma.bloodRequest.findUnique({
            where: { id: requestId },
            include: { requester: true },
        });
        if (!targetRequest) {
            return res.status(404).json({
                success: false,
                error: { message: 'Blood request not found.' },
            });
        }
        // Atomic transaction: Deduct fee from wallet balance, log transaction, record outreach
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Update wallet balance
            const updatedBank = await tx.bloodBank.update({
                where: { id: bloodBankId },
                data: { walletBalance: feeEval.newBalance },
            });
            // 2. Record ledger transaction
            const transaction = await tx.transaction.create({
                data: {
                    bloodBankId,
                    amount: feeEval.deductedAmount,
                    type: 'OUTREACH_MESSAGE_FEE',
                    description: `Fee for outreach message to request ${requestId}`,
                    status: 'COMPLETED',
                },
            });
            return { updatedBank, transaction };
        });
        // Notify requester via socket
        try {
            const io = (0, socket_1.getSocketIO)();
            if (io) {
                io.to(`user_${targetRequest.requesterId}`).emit('blood_bank_outreach', {
                    bloodBank: {
                        id: bloodBank.id,
                        name: bloodBank.name,
                        phone: bloodBank.phone,
                    },
                    requestId,
                    message,
                    timestamp: new Date(),
                });
            }
        }
        catch (e) {
            // ignore
        }
        return res.status(200).json({
            success: true,
            message: `Outreach message dispatched. ${feeEval.deductedAmount} BDT deducted from wallet.`,
            data: {
                newWalletBalance: result.updatedBank.walletBalance,
                deductedFee: feeEval.deductedAmount,
                transactionId: result.transaction.id,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Error sending outreach message.' },
        });
    }
}
async function getBloodBankDetails(req, res) {
    try {
        const { bloodBankId } = req.params;
        const bloodBank = await prisma_1.prisma.bloodBank.findUnique({
            where: { id: bloodBankId },
            include: {
                transactions: { orderBy: { createdAt: 'desc' } },
                reviews: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!bloodBank) {
            return res.status(404).json({ success: false, error: { message: 'Blood Bank not found.' } });
        }
        return res.json({ success: true, data: bloodBank });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
}
async function listAllBloodBanks(req, res) {
    try {
        const banks = await prisma_1.prisma.bloodBank.findMany({
            orderBy: { ratingScore: 'desc' },
            include: {
                _count: { select: { reviews: true } },
            },
        });
        return res.json({ success: true, data: banks });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
}
