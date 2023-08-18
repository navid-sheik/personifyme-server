import CustomError from "../errors/custom-error.js";
import AuthError from "../errors/auth-error.js";
import Seller from "../models/seller-account.js";
import { successResponse } from "../utils/response.js";
import User from "../models/user.js";
import Stripe from 'stripe';
import { v4 as uuidv4 } from "uuid";
import logger from "../logger/index.js";
import Shop from "../models/shop.js";
const stripe = new Stripe( 'sk_test_51NYyrYB6nvvF5XehM7BqvJEdp9EWjsW0AnC24pdrSOWgUAeM3MEFB7sonWa0CHfVp3d7FkXwaZhHvfj1QzyEqdYJ00nmz013nW');


export const createConnectedAccount   =  async (country, user_id) => {

    if(!country) {
        throw new CustomError("Country is required", 400);
    }

    let user   = await User.findById(user_id);
    if(!user) {
        throw new AuthError("User not found", 401);
    }

    //Create new account for stripe 
    const account  = await stripe.account.create({
        type : "custom",
        country : country,
        capabilities : {
            card_payments : {
                requested : true
            },
            transfers : {
                requested : true
            }
        }

    })
    //Create new seller accoutn for local database
    const seller  =  new Seller({
        userId : user._id,
        stripe_account_id : account.id,
        origin_country : country,
        hasStartedOnboarding : true,

    })
    //Save seller account
    await seller.save();
    user.seller_id = seller._id;
    await user.save();


    
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

    seller.shopId = newShop._id;
    await seller.save();

    
    return successResponse("Account created successfully", {id : seller._id, hasStartedOnboarding : seller.hasStartedOnboarding, hasCompletedOnboarding : seller.hasCompletedOnboarding});
    
}
export const requestBoardingLink = async (user_id) => {

    const seller  =  await Seller.findOne({ userId : user_id})
    if (!seller){
        throw new CustomError("Seller account not found", 400);
    }

    const account  =  await stripe.accounts.retrieve(seller.stripe_account_id)
    if (!account) {
        throw new CustomError("Account not found", 400);
    }
   

    const accountLink =  await stripe.accountLinks.create({
        account : account.id,
         // refresh_url: `https://example.com/success`,
         return_url: `https://example.com/success`,
         refresh_url : `${process.env.BASE_URL}/onboarding/refresh/${account.id}`,
         // return_url : `${process.env.BASE_MOBILE_URL}onboarding/success`,
        type : "account_onboarding" ,
        collect : "eventually_due"

    })

    return successResponse("Account link created successfully", accountLink.url);


}

export const refreshOnBoardingLink = async (account_id) => {

    const account = await stripe.accounts.retrieve(account_id);
    if (!account) {
        throw new CustomError("Account Stripe not found", 400);
    }

    const accountLink =  await stripe.accountLinks.create({
        account : account.id,
            // refresh_url: `https://example.com/success`,
            return_url: `https://example.com/success`,
            refresh_url : `${process.env.BASE_URL}/onboarding/refresh/${account.id}`,
            // return_url : `${process.env.BASE_MOBILE_URL}onboarding/success`,
        type : "account_onboarding" ,
        collect : "eventually_due"

    })

    return successResponse("Account link created successfully", accountLink);
    

}

export const updateOnBoardingStatus = async (user_id) => {
    const seller  =  await Seller.findOne({ userId : user_id})
    if (!seller){
        throw new CustomError("Seller account not found", 400);
    }

    const account  =  await stripe.accounts.retrieve(seller.stripe_account_id)
    if (!account) {
        throw new CustomError("Account not found", 400);
    }

    const accountLink =  await stripe.accountLinks.create({
        account : account.id,
         // refresh_url: `https://example.com/success`,
         return_url: `https://example.com/success`,
         refresh_url : `${process.env.BASE_URL}/onboarding/refresh/${account.id}`,
         // return_url : `${process.env.BASE_MOBILE_URL}onboarding/success`,
        type : "account_onboarding" ,
        collect : "eventually_due"

    })

    return successResponse("Account link created successfully", accountLink);

}





export const checkVerificationStripe = async (user_id) => {
    const seller  =  await Seller.findOne({ userId : user_id})
    if (!seller){
        throw new CustomError("Seller account not found", 400);
    }

    const account  =  await stripe.accounts.retrieve(seller.stripe_account_id)
    if (!account) {
        throw new CustomError("Account not found", 400);
    }

    let { payouts_enabled, charges_enabled, requirements } = account;
    
    // Checking if account is fully verified
    let isVerified = payouts_enabled && charges_enabled;

    let response = {
        isVerified,
        payouts_enabled,
        charges_enabled,
        requirements: {
          currently_due: requirements.currently_due,
          eventually_due: requirements.eventually_due,
          past_due: requirements.past_due,
          current_deadline: requirements.current_deadline,
          disabled_reason: requirements.disabled_reason,
          errors: requirements.errors
        }
    };
     // If account is not verified, provide additional details
    if (!isVerified) {
        response['detail'] = 'Account is not fully verified. Please check the requirements for more details.';
        if(requirements.disabled_reason){
            response['disabledDetail'] = `Payout or charge capabilities are disabled due to the following reason: ${requirements.disabled_reason}`;
        }
        if(requirements.errors && requirements.errors.length > 0) {
            response['errorsDetail'] = `There are errors in the provided information. Please correct the following: ${requirements.errors.map(error => error.reason).join(', ')}`;
        }
    }

    if (isVerified) {
        seller.is_verified = true;
        seller.hasCompletedOnboarding = true;
        await seller.save();
        return successResponse("Account verified successfully", response);
    }else {
        seller.is_verified = false;
        seller.hasCompletedOnboarding = false;
        await seller.save();
        return successResponse( "Account not verified successfully", response);
    }




}