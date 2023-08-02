import Product from "../models/product.js";
import ProductError from "../errors/product-error.js";
import Seller from "../models/seller-account.js";
import Category from "../models/category.js";
import AuthError from "../errors/auth-error.js";
import { successResponse } from '../utils/response.js';
import logger from "../logger/index.js";

export default class ProductService {

    static async createProduct(user_id, productData) {
        if (!user_id) {
            throw new AuthError('User not logged in ', 401 )
        }

        const seller = await Seller.findOne({userId : user_id});
        
        if (!seller) {
            throw new AuthError('Seller not found, please become a partner account', 400 )
        }

        const category_id = productData.category_id;
        const category = await Category.findById(category_id);
        if (!category) {
            throw new ProductError('Category not found', 404 )
        }



        let productDataWithSeller = { ...productData, seller_id: seller._id };
        logger.info(seller._id);
        const product = await new Product(productDataWithSeller);
        await product.save();

        return successResponse("Product created successfully", product);
    }

    static async getProducts() {
        const products = await Product.find({isDeleted : false})
            .populate('reviews seller_id category_id');

        return successResponse("Products fetched successfully", products);
    }

    static async updateProduct(user_id, id, productData){
        if (!user_id) {
            throw new AuthError('User not logged in ', 401 )
        }

        const seller = await Seller.findOne({userId : user_id});
        if (!seller) {
            throw new AuthError('Seller not found, please become a partner account', 400 )
        }
        const product =  await Product.findById(id);
        if (!product) {
            throw new ProductError('Product not found', 404 )
        }

       

       
        if (product.seller_id.toString() !== seller._id.toString()) {
            throw new AuthError('You are not authorized to update this product', 400 )
        }
        if (product.isDeleted) {
            return successResponse('Product has been deleted', { product: null });
        }

         // Ensure the productId and userId cannot be updated
        if (productData.seller_id) {
            delete productData.seller_id;
        }
        if (productData.category_id) {
            delete productData.category_id;
        }
        if (productData.isDeleted) {
            delete productData.isDeleted;
        }
        if (productData.reviews) {
            delete productData.reviews;
        }

        


        Object.assign(product, productData); 
        await product.save();

        // const product = await Product.findByIdAndUpdate(id, productData, { new: true, runValidators: true });
        const updatedProduct = await Product.findById(product._id)
            .populate('reviews seller_id category_id');

        return successResponse("Product updated successfully", updatedProduct);
    }

    static async deleteProduct(user_id, id) {
        if (!user_id) {
            throw new AuthError('User not logged in ', 401 )
        }

        const seller = await Seller.findOne({userId : user_id});
        if (!seller) {
            throw new AuthError('Seller not found, please become a partner account', 400 )
        }

        const product = await Product.findById(id);
        if (!product) {
            throw new ProductError('Product not found', 404 )
        }
        

        if (product.seller_id.toString() !== seller._id.toString()) {
            throw new AuthError('You are not authorized to delete this product', 400 )
        }

        if (product.isDeleted) {
            return successResponse('Can\'t update already have been deleted', { product: null });
        }


        product.isDeleted = true;
        await product.save();
        
        
     

        return successResponse("Product deleted successfully", { id: product._id });
    }

    static async getProductById(id) {
        const product = await Product.findById(id)
            .populate('reviews seller_id category_id');
        if (!product) {
            throw new ProductError('Product not found', 404 )
        }
        if (product.isDeleted) {
            return successResponse('Product has been deleted', { product: null });
        }

        return successResponse("Product fetched successfully", {product});
    }
}