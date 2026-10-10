import { RequestHandler } from 'express';
import { submitReview } from './review.service';

/**
 * Functional RequestHandler: Submit verified review
 */
export const submitReviewHandler: RequestHandler = async (req, res, next) => {
  try {
    const reviewerId = req.user?.id || req.body.reviewerId;
    const { bloodBankId, transactionId, rating, comment } = req.body;

    if (!reviewerId || !bloodBankId || !rating || !comment) {
      res.status(400).json({
        success: false,
        error: { message: 'Reviewer ID, Blood Bank ID, rating (1-5), and comment are required.' },
      });
      return;
    }

    const review = await submitReview(
      reviewerId,
      bloodBankId,
      transactionId,
      rating,
      comment
    );

    res.status(201).json({
      success: true,
      message: 'Verified review submitted successfully.',
      data: review,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};

// Compatibility export
export const reviewController = {
  submit: submitReviewHandler,
};
