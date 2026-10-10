import { prisma } from '../../config';
import { SubmitReviewDto } from './review.types';

export * from './review.types';

/**
 * SRP Function 1: Validates that the review rating is an integer between 1 and 5
 */
export const validateRatingRange = (rating: number) => {
  if (rating < 1 || rating > 5) {
    const err: any = new Error('Rating must be an integer between 1 and 5.');
    err.statusCode = 400;
    throw err;
  }
};

/**
 * SRP Function 2: Verifies blood bank exists before creating review
 */
export const findBloodBankForReview = async (bloodBankId: string) => {
  const bloodBank = await prisma.bloodBank.findUnique({
    where: { id: bloodBankId },
    include: { reviews: true },
  });

  if (!bloodBank) {
    const err: any = new Error('Blood Bank not found.');
    err.statusCode = 404;
    throw err;
  }

  return bloodBank;
};

/**
 * SRP Function 3: Persists the review record into the database
 */
export const insertReviewRecord = async (
  reviewerId: string,
  bloodBankId: string,
  transactionId: string | undefined,
  rating: number,
  comment: string
) => {
  return prisma.review.create({
    data: {
      reviewerId,
      bloodBankId,
      transactionId: transactionId || null,
      rating: Math.round(rating),
      comment: comment.trim(),
    },
  });
};

/**
 * SRP Function 4: Pure function - calculates mathematical average from ratings
 */
export const calculateAverageRating = (reviews: Array<{ rating: number }>): number => {
  if (!reviews.length) return 5.0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

/**
 * SRP Function 5: Recalculates and persists blood bank's updated rating score
 */
export const syncBloodBankRatingScore = async (bloodBankId: string) => {
  const allReviews = await prisma.review.findMany({
    where: { bloodBankId },
    select: { rating: true },
  });

  const averageRating = calculateAverageRating(allReviews);

  return prisma.bloodBank.update({
    where: { id: bloodBankId },
    data: { ratingScore: averageRating },
  });
};

/**
 * SRP Function 6: Orchestrates verified review submission
 */
export const submitReview = async (
  reviewerId: string,
  bloodBankId: string,
  transactionId: string | undefined,
  rating: number,
  comment: string
) => {
  validateRatingRange(rating);
  await findBloodBankForReview(bloodBankId);

  const review = await insertReviewRecord(
    reviewerId,
    bloodBankId,
    transactionId,
    rating,
    comment
  );

  await syncBloodBankRatingScore(bloodBankId);

  return review;
};

// Compatibility export
export const reviewService = {
  submitReview,
};
