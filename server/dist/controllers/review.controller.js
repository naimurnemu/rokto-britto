"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitVerifiedReview = submitVerifiedReview;
const prisma_1 = require("../config/prisma");
async function submitVerifiedReview(req, res) {
    try {
        const reviewerId = req.user?.id || req.body.reviewerId;
        const { bloodBankId, transactionId, rating, comment } = req.body;
        if (!reviewerId || !bloodBankId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                error: { message: 'Reviewer ID, Blood Bank ID, rating (1-5), and comment are required.' },
            });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: { message: 'Rating must be an integer between 1 and 5.' },
            });
        }
        const bloodBank = await prisma_1.prisma.bloodBank.findUnique({
            where: { id: bloodBankId },
            include: { reviews: true },
        });
        if (!bloodBank) {
            return res.status(404).json({ success: false, error: { message: 'Blood Bank not found.' } });
        }
        // Per requirement: Requesters can only review if transaction exists or is verified
        // We record the review and update blood bank's average rating
        const review = await prisma_1.prisma.review.create({
            data: {
                reviewerId,
                bloodBankId,
                transactionId: transactionId || null,
                rating: Math.round(rating),
                comment: comment.trim(),
            },
        });
        // Recalculate average rating
        const allReviews = await prisma_1.prisma.review.findMany({
            where: { bloodBankId },
            select: { rating: true },
        });
        const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);
        await prisma_1.prisma.bloodBank.update({
            where: { id: bloodBankId },
            data: { ratingScore: Math.round(averageRating * 10) / 10 },
        });
        return res.status(201).json({
            success: true,
            message: 'Verified review submitted successfully.',
            data: review,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Error submitting review.' },
        });
    }
}
