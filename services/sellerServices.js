import Seller from "../models/seller-account.js";
import AuthError from "../errors/auth-error.js";

import { successResponse } from '../utils/response.js';
import Product from "../models/product.js";
import ProductError from "../errors/product-error.js";
import { uploadMoreImages } from "../utils/cloudinary.js";
import Stripe from 'stripe';
import CustomError from "../errors/custom-error.js";
const stripe = new Stripe( 'sk_test_51NYyrYB6nvvF5XehM7BqvJEdp9EWjsW0AnC24pdrSOWgUAeM3MEFB7sonWa0CHfVp3d7FkXwaZhHvfj1QzyEqdYJ00nmz013nW');


export default class SellerService {

    static async getSellerProducts (user_id) {

        let seller  = await Seller.findOne({ userId : user_id });
        if (!seller) {
            throw new AuthError('Seller not found', 404);
        }

        const products = await Product.find({ seller_id : seller._id }).populate('seller_id category_id') ;
        return successResponse("Products fetched successfully", products);


    }
    

    static async updateSellerProduct(user_id, product_id, productData) {
        // Find the seller using the provided user_id
        let seller = await Seller.findOne({ userId : user_id });
        if (!seller) {
            throw new AuthError('Seller not found', 404);
        }
    
        // Find the existing product using the provided product_id and seller_id
        const product = await Product.findOne({ _id: product_id, seller_id: seller._id });
        if (!product) {
            throw new ProductError('Product not found or you do not have permission to update this product', 404);
        }
    
        console.log(productData.product);
        console.log(productData.newImages.length);
        console.log(productData.delete_urls);
    
        // Upload new images and append the URLs to the product's images
        if (productData.newImages && productData.newImages.length > 0) {
            try {
                const newImageUrls = await uploadMoreImages(productData.newImages, seller._id.toString(), product_id.toString());
                product.images = [...product.images, ...newImageUrls];
                console.log("New images uploaded");
            } catch (error) {
                console.log("Something went wrong");
                console.log("Error uploading images", error);
                // Handle the error as needed, e.g., throw an error, delete the product, etc.
            }
        }
        
        // Delete images whose URLs are in productData.deleteUrls
        if (productData.delete_urls && productData.delete_urls.length > 0) {
            try {
                // Actually delete the images from your storage solution here, based on the URLs in deleteUrls
                // ...
                // Remove the URLs in deleteUrls from the product's images array
               
                product.images = product.images.filter(imageUrl => !productData.delete_urls.includes(imageUrl));
                console.log("Images deleted successfully");
            } catch (error) {
                console.log("Error deleting images", error);
                // Handle the error as needed, e.g., throw an error, delete the product, etc.
            }
        }
        
        // Update the product with the new data provided in productData.product
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: product_id, seller_id: seller._id },
            { ...productData.product, images: product.images },
            { new: true, runValidators: true }
        );
        
        // Save the product with the updated image URLs
        await updatedProduct.save();
        
        return successResponse("Product updated successfully", updatedProduct);
    }
    

    static async deleteSellerProduct(user_id, product_id) {

        // Find the seller using the provided user_id
        let seller = await Seller.findOne({ userId: user_id });
        if (!seller) {
            throw new AuthError('Seller not found', 404);
        }
        
        // Find the product with the provided product_id and owned by the found seller
        const product = await Product.findOne({ _id: product_id, seller_id: seller._id });
        
        // Check if a product was actually found
        if (!product) {
            throw new ProductError('Product not found or you do not have permission to delete this product', 404);
        }
    
        // Mark the product as deleted by setting isDeleted to true
        product.isDeleted = true;
    
        // Save the updated product
        await product.save();
    
        return successResponse("Product deleted successfully", product._id);
    }
    
    static async getSellerStripeStatus(user_id) {

        // Find the seller using the provided user_id
        let seller = await Seller.findOne({ userId: user_id });
        if (!seller) {
        throw new CustomError('Seller not found', 404);
        }

        // Retrieve the Stripe account using the seller's stripe_account_id
        const account = await stripe.accounts.retrieve(seller.stripe_account_id);
        if (!account) {
        throw new CustomError('Stripe account not found', 404);
        }
        console.log(account)

        // Check the Stripe account's verification status
        const requirements = account.requirements;
        const verificationStatus = requirements.currently_due.length === 0 && requirements.disabled_reason === null;
        const enabled_status = account.charges_enabled && account.payouts_enabled

        // if (!verificationStatus) {

        
        
        seller.hasCompletedOnboarding = verificationStatus && enabled_status;
        seller.is_verifed = verificationStatus && enabled_status;
        seller.save();


        return successResponse('The Stripe account is restricted', account );
        // if (verificationStatus.status === 'verified') {
        // return successResponse('The Stripe account is verified', { status: 'verified' });
        // } else if (verificationStatus.status === 'unverified') {
        // return successResponse('The Stripe account is not verified', { status: 'unverified' });
        // } else if (verificationStatus.status === 'pending') {
        // return successResponse('The Stripe account is pending verification', { status: 'pending' });
        // } else {
        // let disabled_reason = verificationStatus.disabled_reason || 'Unknown reason';
        // return successResponse('The Stripe account is restricted', { status: 'restricted', disabled_reason });
        // }


    }

    static async requestNewOnboardingLink(user_id) {
    
        // Find the seller using the provided user_id
        const seller = await Seller.findOne({ userId: user_id });
        
        if (!seller) {
          throw new CustomError('Seller account not found', 400);
        }
    
        // Retrieve the Stripe account associated with this seller
        const account = await stripe.accounts.retrieve(seller.stripe_account_id);
        
        if (!account) {
          throw new CustomError('Stripe account not found', 400);
        }
        
        // Create a new Stripe account link for this seller
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${process.env.BASE_URL}/onboarding/refresh/${account.id}`,
          return_url: `https://example.com/success`,
          type: 'account_onboarding',
          collect: 'eventually_due'
        });
    
        return successResponse('New account link created successfully', accountLink);
      }


    



    
        


    static async createSellerAccount(user_id, sellerData) {
        // Verify the user_id, check if it’s valid and if a user with that ID exists
        // Create a new seller account using the Seller model with sellerData
        // Save the new seller account to the database
        // Return success response with the created seller account
        
        // Example:
        // let user = await User.findById(user_id);
        // if (!user) {
        //    throw new AuthError('User not found', 401);
        // }
        // const seller = new Seller({ ...sellerData, userId: user_id });
        // await seller.save();
        // return successResponse("Seller Account created successfully", seller);
    }

    static async getSellerAccounts() {
        // Fetch all seller accounts from the database
        // Return success response with the fetched seller accounts
    }

    static async getSellerAccountById(sellerId) {
        // Fetch a specific seller account from the database using sellerId
        // Check if the seller account exists, if not throw an error
        // Return success response with the fetched seller account
    }

    static async updateSellerAccount(user_id, sellerId, sellerData) {
        // Verify the user_id, check if it’s valid and if a user with that ID exists
        // Update a specific seller account using sellerId and sellerData
        // Check if the seller account exists, if not throw an error
        // Save the updates to the database
        // Return success response with the updated seller account
    }


}