import Category from "../models/category.js";
import CustomError from "../errors/custom-error.js";
import { successResponse } from '../utils/response.js';
import Seller from "../models/seller-account.js";
import Product from "../models/product.js";
import Search from "../models/searches.js";
import Shop from "../models/shop.js";

class SearchServices {
  
    
    static async filteredSearch(user_id , query) {

        
        const page =  parseInt(query.page) - 1 || 0
        // The number of posts per page
        const limit =  parseInt(query.limit) || 5
        //The number of posts to skip
        const skip =  page * limit 
        
        // The search query
        const search  = (query.search || "").toLowerCase();


        let searchQueryData = {
            query: search
        };
    
        // Check if the search query is not empty before saving it to the database
        if (search.trim().length > 0) {
            const existingSearchQuery = await Search.findOne({ query: search });
    
            if (existingSearchQuery) {
                // If this search query already exists, increment the count by 1
                existingSearchQuery.count += 1;
                await existingSearchQuery.save();
            } else {
                // If this is a new search query, save it to the database
                const searchQuery = new Search(searchQueryData);
                await searchQuery.save();
            }
        }


        const products = await Product.find({
            title: { $regex: search, $options: "i" },
            isDeleted: false
        })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'seller_id',
            model: Seller,
            populate: {
                path: 'shopId',
                model: Shop
            }
        });

        const total = await Product.countDocuments({
            title: { $regex: search, $options: "i" },
            isDeleted: false
        });
        let object = {
            error: false, 
            total : total,
            page : page + 1,
            limit : limit,
            products : products
        
        
        }
        return successResponse("Products fetched successfully", object);

    }

    static async getAllSearches() {
        const searches = await Search.find({})
            .sort({ count: -1 })

        
           
           
        return successResponse("Searches fetched successfully", searches);
    }

    static async searchQueries(querySearch) {
        const search = (querySearch.search || "").toLowerCase();
        
        // First, we use a regex to find queries that start with the input string
        const startWithSearchRegex = new RegExp("^" + search, 'i');
        
        const startsWithSearches = await Search.find({
            query: { $regex: startWithSearchRegex }
        })
        .sort({ count: -1 });
        
        // Next, we use a regex to find queries that include the input string
        // but don't start with it
        const includesSearchRegex = new RegExp("(?!^" + search + ").*" + search, 'i');
        
        const includedSearches = await Search.find({
            query: { $regex: includesSearchRegex }
        })
        .sort({ count: -1 });
        
        // Merge both sets of results into a single list
        const searches = startsWithSearches.concat(includedSearches);
        
        // Custom sort function to arrange the results based on closest match
        searches.sort((a, b) => {
            // Check the position of the search query in each string
            const aIndex = a.query.toLowerCase().indexOf(search.toLowerCase());
            const bIndex = b.query.toLowerCase().indexOf(search.toLowerCase());
            
            // Check the length difference between each result and the search query
            const aDiff = Math.abs(a.query.length - search.length);
            const bDiff = Math.abs(b.query.length - search.length);
            
            // Compare based on position, then on length difference
            if (aIndex !== bIndex) {
                return aIndex - bIndex;
            } else {
                return aDiff - bDiff;
            }
        });
        
        return successResponse("Search queries fetched successfully", searches);
    }


    
}

export default SearchServices;