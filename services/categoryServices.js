import Category from "../models/category.js";
import CustomError from "../errors/custom-error.js";
import { successResponse } from '../utils/response.js';
import Seller from "../models/seller-account.js";
import Product from "../models/product.js";

class CategoryService {
  
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

    static async getParentCategories() {
        const categories = await Category.find({}).populate('parent', 'name').where('parent').equals(null);
        return successResponse("Categories fetched successfully", categories);
    }


    //TODO : To not allow to modify the id of the parent category
    static async updateCategory(user_id, id, categoryData) {

        const seller  = await Seller.find({userId : user_id});
        if (!seller) {
            throw new AuthError('Seller not found, please become a partner account', 400 )
        }
        
        const category = await Category.findByIdAndUpdate(id, categoryData, { new: true, runValidators: true });
        if (!category) {
            throw new CustomError('Category not found', 404);
        }


        return successResponse("Category updated successfully", category);
    }

    static async deleteCategory(user_id, id) {
        const seller  = await Seller.find({userId : user_id});
        if (!seller) {
            throw new AuthError('Seller not found, please become a partner account', 400 )
        }
       
        const category = await Category.findById(id);
        if (!category) {
            throw new CustomError('Category not found', 404);
        }
        const children = await Category.find({ parent: id });
        if (children.length > 0) {
            throw new Error("Cannot delete a category that has children");
        }
        
        await Category.findByIdAndDelete(id);

        return successResponse("Category deleted successfully", { id: category._id });
    }

    static async getCategoryById(id) {
        const category = await Category.findById(id);
        if (!category) {
            throw new CustomError('Category not found', 404);
        }
        return successResponse("Category fetched successfully", category);
    }



    static async getSubcategories(id) {
        const subcategories = await Category.find({ parent: id });
        return successResponse("Subcategories fetched successfully", subcategories);
    }

    static async getProductsByCategory(categoryId) {

        const products = await Product.find({ category: categoryId });
            
        return successResponse("All Proudct", products);;
   
    }
}

export default CategoryService;