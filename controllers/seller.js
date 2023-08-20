import Seller from "../models/seller-account.js"
import SellerService from "../services/sellerServices.js";
import { errorResponse } from "../utils/response.js";
import Stripe from 'stripe';
const stripe = new Stripe( 'sk_test_51NYyrYB6nvvF5XehM7BqvJEdp9EWjsW0AnC24pdrSOWgUAeM3MEFB7sonWa0CHfVp3d7FkXwaZhHvfj1QzyEqdYJ00nmz013nW');




export const getSellerAccount = async (req, res) => {
    const user_id  = req.user

    try{

        const seller  =  await Seller.findOne({ userId : user_id})
        if (!seller){
            console.log(error.message);
            let response =  errorResponse(error.message, 400, "Seller Error")
             return res.status(400).json(response);
        }

        return res.status(200).json({ success : true,  result : {id : seller._id, hasStartedOnboarding : seller.hasStartedOnboarding, hasCompletedOnboarding : seller.hasCompletedOnboarding}});
    }

    catch (error) {
        console.log(error.message);
       let response =  errorResponse(error.message, 500, "Seller Error")
        return res.status(500).json(response);
    }

}


export const getSellerProducts = async (req, res, next) => {
    try {
        const user_id = req.user; 
        const response = await SellerService.getSellerProducts(user_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};





export const deleteSellerProduct = async (req, res, next) => {
    try {
        const user_id = req.user; 
        const product_id = req.params.id; 
        const response = await SellerService.deleteSellerProduct(user_id, product_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const updateSellerProduct = async (req, res, next) => {
    try {
        const user_id = req.user;
        const product_id = req.params.id;
        const productData = req.body;
        const response = await SellerService.updateSellerProduct(user_id, product_id, productData);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};




// Function to get Stripe account verification status
export const getSellerStripeStatus = async (req, res, next) => {
    try {
        const user_id = req.user
        const response = await SellerService.getSellerStripeStatus(user_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

// Function to request a new Stripe onboarding link
export const requestNewOnboardingLink = async (req, res, next) => {
    try {
        const user_id = req.user 
        const response = await SellerService.requestNewOnboardingLink(user_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};