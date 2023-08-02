import Review from "../models/review.js";
import Product from "../models/product.js";
import ReviewError from "../errors/review-error.js";
import AuthError from "../errors/auth-error.js";
import Seller from "../models/seller-account.js";
import { successResponse } from '../utils/response.js';

export default class ReviewService {

    static async createReview(user_id, reviewData) {
        if (!user_id) {
            throw new AuthError('User not logged in ', 401 )
        }

        const review = new Review({ ...reviewData, user: user_id });
        await review.save();
        
        return successResponse("Review created successfully", review);
    }

    static async getReviews() {
        const reviews = await Review.find({}).populate('userId');
        return successResponse("Reviews fetched successfully", reviews);
    }


    static async updateReview(user_id, id, reviewData) {
        if (!user_id) {
            throw new AuthError('User not logged in ', 401 )
        }


        // Ensure the productId and userId cannot be updated
        if (reviewData.productId) {
            delete reviewData.productId;
        }
        if (reviewData.userId) {
            delete reviewData.userId;
        }

        const review = await Review.findByIdAndUpdate(id, reviewData, { new: true, runValidators: true });
        if (!review) {
            throw new ReviewError('Review not found', 404);
        }

        return successResponse("Review updated successfully", review);
    }

    //TODO : To modify as only moderator can deactivate or delete a review

    static async deleteReview(user_id, id) {
        if (!user_id) {
            throw new AuthError('User not logged in ', 401 )
        }

        const seller = await Seller.findOne({userId : user_id});
        if (!seller) {
            throw new AuthError('Seller not found, please become a partner account', 400 )
        }

        const review = await Review.findByIdAndDelete(id);
        if (!review) {
            throw new ReviewError('Review not found', 404);
        }

        return successResponse("Review deleted successfully", { id: review._id });
    }

    static async getReviewById(id) {
        const review = await Review.findById(id).populate('userId');
        if (!review) {
            throw new ReviewError('Review not found', 404);
        }

        return successResponse("Review fetched successfully", review);
    }

    static async getReviewsByProduct(productId) {
        const reviews = await Review.find({ productId: productId }).populate('userId');
        if (!reviews) {
            throw new ReviewError('No reviews found for this product', 404);
        }

        return successResponse("Reviews fetched successfully", reviews);
    }
}