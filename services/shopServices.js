import Shop from "../models/shop.js";
import AuthError from "../errors/auth-error.js";
import { successResponse } from '../utils/response.js';
import Seller from "../models/seller-account.js";
import SellerError from "../errors/seller-error.js";
import Product from "../models/product.js";
import Category from "../models/category.js";
import CategoryError from "../errors/category-error.js";
import User from "../models/user.js";
import mongoose from "mongoose";
import OrderItem from "../models/orderItem.js";
import logger from "../logger/index.js";
import { uploadImage } from "../utils/cloudinary.js";




export default class ShopService {

    static async createShop(user_id, shopData) {
        const seller = await Seller.findOne({ userId: user_id });

        const user  =  await User.findById(user_id);
        
        if (!seller) {
            throw new AuthError('Seller not found', 404);
        }
        
        // Check if the seller already has a shop
        const existingShop = await Shop.findOne(seller.shopId);
        
        if (existingShop) {
            throw new SellerError('Seller is allowed to have only one shop', 422 );
            // Alternatively, you can return a response with a status and message
            // return {
            //     status: 400,
            //     message: 'Seller is allowed to have only one shop'
            // };
        }
        

        let category = await  Category.find({});
        //take the first category
        

        if (!category){
            throw new CategoryError('Category not found', 404);
        }

        const shop = new Shop({
            ...shopData,
            categoryId : category[0]._id,
            categoryName : category[0].name,
            emailSupport : user.email,

        });
    
        await shop.save();

        seller.shopId = shop._id;
        await seller.save();
        
        return successResponse("Shop created successfully", shop);
    }

    static async getShopForSeller(user_id) {
        const seller = await Seller.findOne({ userId : user_id})
        if (!seller){
            throw new AuthError('Seller not found', 404);
        }

        let shop = await Shop.findById(seller.shopId);
        
        if (!shop) {
            throw new AuthError('Shop not found', 404);
        }
        
        return successResponse("Shop fetched successfully", shop);
    }
    static async getShopProducts(seller_id) {
        const  products = await Product.find({seller_id : seller_id})
        .populate({
            path: 'seller_id',
            model: 'Seller',
            populate: {
                path: 'shopId',
                model: 'Shop'
            }
        })
        .populate('category_id');;
    
        return successResponse("Shop fetched successfully", products);
    }

    static async getShopById(shop_id) {
      
        let shop = await Shop.findById(shop_id);
        
        if (!shop) {
            throw new AuthError('Shop not found', 404);
        }
        
        return successResponse("Shop fetched successfully", shop);
    }
    
    
    static async updateShop(user_id, shopData) {
        // Wait for the Seller query to complete
        const seller = await Seller.findOne({ userId: user_id });
        
        if (!seller) {
            throw new AuthError('Seller not found', 404);
        }
    
        let shop = await Shop.findById(seller.shopId)
        
        if (!shop) {
            throw new AuthError('Shop not found', 404);
        }
        
        // Input validation example
        if (shopData.name && shopData.name.trim() === '') {
            throw new AuthError('Shop name must not be empty', 400);
        }
        
        // Check if a different shop with the same name already exists
        const existingShopWithSameName = await Shop.findOne({ 
            name: shopData.name,
            _id: { $ne: shop._id }  // Exclude the current shop from the search
        });
        
        if (existingShopWithSameName) {
            throw new AuthError('A shop with this name already exists', 400);
        }
        
        // Check if image is provided in shopData
        const imageString = shopData.image;
        const shopId = shop._id;  // Assuming shop._id is the product id
        
        if (imageString && isBase64(imageString)) {
            // If shop.image is not empty and not a URL, then upload it
            try {
                const newImageUrl = await uploadImage(imageString, 'shop_images', shopId.toString());
                // After the image is uploaded, set the shop.image field with the new URL
                console.log('Uploaded image:', newImageUrl);
                shop.image = newImageUrl;
            } catch (error) {
                logger.error(error);
                console.error('Error uploading image:', error.message);
                throw new AuthError('Failed to upload image', 500);
            }
        }
        
        // Selective updates: Only update fields that are in shopData, excluding the image
        for (let field in shopData) {
            if (shopData.hasOwnProperty(field) && field !== 'image' && shop[field] !== undefined) {
                shop[field] = shopData[field];
            }
        }
    
        // Save the shop and return the updated document
        const updatedShop = await shop.save();
        
        return successResponse("Shop updated successfully", updatedShop);
    }

     
    
    
    static async deactivateShop(user_id) {

        const seller = await Seller.findOne({ userId: user_id });
        if (!seller) {
            throw new AuthError('Seller not found', 404);
        }

        let shop = await Shop.findById(seller.shopId)
        
        if (!shop) {
            throw new AuthError('Shop not found', 404);
        }
        
        shop.isActive = false;
        await shop.save();
        
        return successResponse("Shop deactivated successfully", shop._id);
    }


    static async activateShop(user_id) {

        const seller = await Seller.findOne({ userId: user_id });
        if (!seller) {
            throw new AuthError('Seller not found', 404);
        }

        let shop = await Shop.findById(seller.shopId)
        
        if (!shop) {
            throw new AuthError('Shop not found', 404);
        }
        
        shop.isActive = true;
        await shop.save();
        
        return successResponse("Shop activate successfully", shop._id);
    }

    // ... other methods ...

    static async followShop(user_id, shop_id) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = await User.findById(user_id).session(session);
            if (!user) {
                throw new AuthError('User not found', 404);
            }

            const shop = await Shop.findById(shop_id).session(session);
            if (!shop) {
                throw new SellerError('Shop not found', 404);
            }

            if (shop.followers.includes(user_id)) {
                throw new SellerError('User is already following this shop', 422);
            }

            const updatedShop = await Shop.findByIdAndUpdate(
                shop_id,
                {
                    $inc: { follows: 1 },
                    $addToSet: { followers: user_id }
                },
                { new: true, session: session }
            );

            await User.findByIdAndUpdate(
                user_id,
                {
                    $addToSet: { shopFollowed: shop_id }
                },
                { new: true, session: session }
            );

            await session.commitTransaction();
            
            return successResponse("Shop deactivated successfully", updatedShop);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }



    static async unfollowShop(user_id, shop_id) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = await User.findById(user_id).session(session);
            if (!user) {
                throw new AuthError('User not found', 404);
            }

            const shop = await Shop.findById(shop_id).session(session);
            if (!shop) {
                throw new SellerError('Shop not found', 404);
            }

            if (!shop.followers.includes(user_id)) {
                throw new SellerError('User is not following this shop', 422);
            }

            const updatedShop = await Shop.findByIdAndUpdate(
                shop_id,
                {
                    $inc: { follows: -1 }, // Decrement the follows count by 1
                    $pull: { followers: user_id } // Remove the user from the followers list
                },
                { new: true, session: session }
            );

            await User.findByIdAndUpdate(
                user_id,
                {
                    $pull: { shopFollowed: shop_id } // Remove the shop from the user's followed shops list
                },
                { new: true, session: session }
            );

            await session.commitTransaction();

           
            return successResponse("Shop deactivated successfully", updatedShop);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }


    static async getShopNumberItemSold(seller_id){
        const orders =  await OrderItem.find({seller : seller_id})


        return successResponse("Get all order count  successfully", orders.length);




    }

    static async checkShopPriviligies (user_id, shop_id) {
        let seller = await Seller.findOne({ userId: user_id });
        console.log(seller)
        if (!seller) {
            throw new AuthError('Seller not found', 404);
        }
        if (seller.shopId != shop_id) {
            throw new AuthError('Not your shop', 404);
        }

        return successResponse("Shop admin priviliges", true);

    }
}

function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch (err) {
        return false;
    }
}
function isBase64(str) {
    try {
      // Check if the string has the base64 format: data:image/[type];base64,[data]
      return Boolean(str.match(/^data:image\/([a-zA-Z]+);base64,/));
    } catch (err) {
      return false;
    }
  }