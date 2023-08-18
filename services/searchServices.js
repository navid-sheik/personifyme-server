import Category from "../models/category.js";
import CustomError from "../errors/custom-error.js";
import { successResponse } from '../utils/response.js';
import Seller from "../models/seller-account.js";
import Product from "../models/product.js";
import Search from "../models/search.js";

class SearchServices {
  
    static async createCategory(user_id, categoryData) {

        const seller  = await Seller.find({userId : user_id});
        if (!seller) {
            throw new AuthError('Seller not found, please become a partner account', 400 )
        }


        const category = await Category.create(categoryData);

        return successResponse("Category created successfully",category);
    }

    static async getCategories() {
        const categories = await Category.find({}).populate('parent', 'name');
        return successResponse("Categories fetched successfully", categories);
    }

    
}

export default SearchServices;