import Review from "../models/review.js";
import Product from "../models/product.js";
import ReviewError from "../errors/review-error.js";
import AuthError from "../errors/auth-error.js";
import Seller from "../models/seller-account.js";
import { successResponse } from '../utils/response.js';
import User from "../models/user.js";

export default class ReviewService {

    static async createReview(user_id, reviewData) {

        let user  = await User.findById(user_id);
        if (!user) {
            throw new AuthError('User not logged in ', 401 )
        }

        const review = new Review({ ...reviewData, username : user.username });
        await review.save();

        // Update the product review 

        
        return successResponse("Review created successfully", review);
    }

    static async getReviews() {
        const reviews = await Review.find({});
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
        if (reviewData.username) {
            delete reviewData.username;
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
        const review = await Review.findById(id);
        if (!review) {
            throw new ReviewError('Review not found', 404);
        }

        return successResponse("Review fetched successfully", review);
    }

    static async getReviewsByProduct(productId) {
        const reviews = await Review.find({ productId: productId })
        if (!reviews) {
            throw new ReviewError('No reviews found for this product', 404);
        }

        return successResponse("Reviews fetched successfully", reviews);
    }
}