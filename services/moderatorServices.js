import Product from "../models/product.js";  // Assuming the Product model is named 'Product'
import User from "../models/user.js";  // Assuming the User model is named 'User'
import { successResponse } from '../utils/response.js';
import AuthError from "../errors/auth-error.js";
import CustomError from "../errors/custom-error.js";
import ProductError from "../errors/product-error.js";

export default class ModeratorService {

    static async approveItem(moderatorId,productId) {
        console.log(productId)
        const product = await Product.findById(productId);
        if (!product) {
            throw new ProductError('Product not found', 404);
        }

        product.isApproved = true;
        await product.save();

        return successResponse("Product approved successfully", product);
    }

    static async disapproveItem(moderatorId, productId, moderationMessage) {
        const product = await Product.findById(productId);
        if (!product) {
            throw new ProductError('Product not found', 404);
        }

        product.isApproved = false;
        product.moderationMessage = moderationMessage;
        await product.save();

        return successResponse("Product disapproved successfully", product);
    }



    static async getAllUnverifiedProducts() {
        // const unverifiedProducts = await Product.find({ isApproved: false });
        const unverifiedProducts = await Product.find({
            isApproved: false,
            moderationMessage: { $exists: false }
        });

        return successResponse("Unverified products fetched successfully", unverifiedProducts);
    }


}