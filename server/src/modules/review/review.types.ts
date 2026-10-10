/**
 * Review module types and interfaces
 */

export interface SubmitReviewDto {
  reviewerId: string;
  bloodBankId: string;
  transactionId?: string;
  rating: number;
  comment: string;
}
