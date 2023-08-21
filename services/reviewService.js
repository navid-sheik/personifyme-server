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


         // Check if the user has already left a review for this product
        const existingReview = await Review.findOne({
            user_id: user._id,
            productId: reviewData.productId
        });

        if (existingReview) {
            // Throw an error or return a response saying that the user has already reviewed this product
            throw new ReviewError("You have already reviewed this product", 400);
        }

        const review = new Review({ ...reviewData, user_id : user._id });

   
        await review.save();

        await review.populate({ path: 'user_id', select: 'name image' })
        await review.populate({ path: 'productId' })
        // await review.populate({
        //     path: 'user_id',
        //     select: 'name image' // Select only 'username' and 'image'
        // }).populate({
        //     path: 'productId',
        //     // select: 'productName price' // or whatever fields you want to select from Product
        // });


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
        if (reviewData.user_id) {
            delete reviewData.user_id;
        }

        const review = await Review.findByIdAndUpdate(id, reviewData, { new: true, runValidators: true });
        if (!review) {
            throw new ReviewError('Review not found', 404);
        }
        await review
        .populate({
            path: 'user_id',
            select: 'name image' // Select only 'username' and 'image'
        }).populate({
            path: 'productId',
            // select: 'productName price' // or whatever fields you want to select from Product
        });

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

        return successResponse("Review deleted successfully", review._id );
    }

    static async getReviewById(id) {
        const review = await Review.findById(id).populate({
            path: 'user_id',
            select: 'name image' // Select only 'username' and 'image'
          }).populate({
            path: 'productId',
            // select: 'productName price' // or whatever fields you want to select from Product
        });
        if (!review) {
            throw new ReviewError('Review not found', 404);
        }

        return successResponse("Review fetched successfully", review);
    }

    static async getReviewsByProduct(productId) {
        const reviews = await Review.find({ productId: productId }).populate({
            path: 'user_id',
            select: 'name image' // Select only 'username' and 'image'
          }).populate({
            path: 'productId',
            // select: 'productName price' // or whatever fields you want to select from Product
        });
        if (!reviews) {
            throw new ReviewError('No reviews found for this product', 404);
        }

        return successResponse("Reviews fetched successfully", reviews);
    }

    static async getAllReviewFromUser(user_id) {
        const reviews = await Review.find({ user_id }).populate({
            path: 'user_id',
            select: 'name image' 
        }).populate({
            path: 'productId',
            // select: 'productName price' // or whatever fields you want to select from Product
        });
        if (!reviews) {
            throw new ReviewError('No reviews found for this user', 404);
        }
        return successResponse("Reviews fetched successfully for logged-in user", reviews);
    }
    


    static async getReviewForShop(seller_id) {
        // Find the seller
        const seller = await Seller.findById(seller_id);
        if (!seller) {
            throw new AuthError('Seller not found', 400);
        }
      
        // Find the products of this seller
        const products = await Product.find({ seller_id: seller._id });
    
        // Collect product IDs to use in finding reviews
        const productIds = products.map(product => product._id);
    
        // Find reviews for those products
        const reviews = await Review.find({
            productId: { $in: productIds }
        }).populate({
            path: 'user_id',
            select: 'name image'
        }).populate({
            path: 'productId',
            // select: 'productName price' // or whatever fields you want to select from Product
        });
    
        if (!reviews.length) {
            return successResponse("No reviews found for this shop", []);
        }
    
        return successResponse("Reviews fetched successfully for the shop", reviews);
    }
}