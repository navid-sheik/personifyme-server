//Create a custom onBoarding experience usnig Stripe Connect for a markeplace allowing the user to check if they are verified, update their details  and handle future or incominng requirements and verifications and all other edges case in express using restAPI pattern and MVC design pattern.

import logger from "../logger/index.js";
import Seller from "../models/selller-account.js";
import User from "../models/user.js";
import Stripe from 'stripe';


const stripe = new Stripe( 'sk_test_51NYyrYB6nvvF5XehM7BqvJEdp9EWjsW0AnC24pdrSOWgUAeM3MEFB7sonWa0CHfVp3d7FkXwaZhHvfj1QzyEqdYJ00nmz013nW');





//Create account Stripe Connect 

export const createConnectAccount = async (req, res) => {

    const {country } = req.body;
    const user_id  = req.user;

 



    if(!country) return res.status(400).json({ success : false, error : "Country is required"});

    //Become a seller if not already
    let  user  =  await User.findById(user_id)

  

   



    if(!user) return res.status(400).json({ success : false, error : "User not found"});
    

    try {

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


        const seller  =  new Seller({
            userId : user._id,
            stripe_account_id : account.id,
            origin_country : country,
            hasStartedOnboarding : true,


        })

        await seller.save();
        user.seller_id = seller._id;
        await user.save();


        return res.status(200).json({ success : true,  message : "Stripe Connect Account Created"});
    }
    catch (error) {
        console.log(error.message);
        return res.status(400).json({  success : false, error : error.message });
    }
}






//Create account Link Stripe Connnect On Boarding 

export const requestOnBoardingLink  =  async (req, res) => {
    const user_id  = req.user;
    


    // logger.log("info", "Requesting Stripe Connect Account Link");
    // logger.error(user_id)

    try{
     
        const seller  =  await Seller.findOne({ userId : user_id})
        const account  =  await stripe.accounts.retrieve(seller.stripe_account_id)
        if (!account) return res.status(400).json({ success : false, error : "Account  not found, retry or contact support"});

        const accountLink =  await stripe.accountLinks.create({
            account : account.id,
             // refresh_url: `https://example.com/success`,
             return_url: `https://example.com/success`,
             refresh_url : `${process.env.BASE_URL}/onboarding/refresh/${account.id}`,
             // return_url : `${process.env.BASE_MOBILE_URL}onboarding/success`,
            

            type : "account_onboarding" ,
            collect : "eventually_due"

        })

        // if (seller.hasStartedOnboarding === false) {
        //     seller.hasStartedOnboarding = true;
        //     await seller.save();
        // }

        return res.status(200).json({ success : true,  message : "Stripe Connect Account Link Created", url : accountLink.url});

      



    }catch(error){
        console.log(error);
        return res.status(400).json({  success : false, error : error.message });
    }
}


export const  refreshOnBoardingLink  =  async (req, res) => {
    try {

        const {account_id} = req.params;
        const account = await stripe.accounts.retrieve(account_id);
        if (!account) {
        return res.status(404).json({ error: 'Account not found' });
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

        

        return res.status(200).json({ success : true,  message : "Stripe Connect Account Link Created", url : accountLink.url});

    }catch(error){
        console.log(error);
        return res.status(400).json({  success : false, error : "Error refreshing account link" });
    }
}

//Create account Link Stripe Connnect On Boarding 

export const updateOnBoardingLink  =  async (req, res) => {
    const user_id  = req.user;
    console.log("updateOnBoardingLink")

    try{
        const seller  =  await Seller.findOne({ userId : user_id})
        const account  =  await stripe.accounts.retrieve(seller.stripe_account_id)
        if (!account) return res.status(400).json({ success : false, error : "Account  not found, retry or contact support"});

        const accountLink =  await stripe.accountLinks.create({
            account : account.id,
             // refresh_url: `https://example.com/success`,
             return_url: `https://example.com/success`,
             refresh_url : `${process.env.BASE_URL}/onboarding/refresh/${account.id}`,
             // return_url : `${process.env.BASE_MOBILE_URL}onboarding/success`,
            type : "account_onboarding" ,
            collect : "eventually_due"

        })

        return res.status(200).json({ success : true,  message : "Stripe Connect Account Link Created", url : accountLink.url});

      



    }catch(error){
        console.log(error);
        return res.status(400).json({  success : false, error : error.message });
    }
}

export const checkVerificationStripe = async (req, res) => {
    const user_id  = req.user;



    try {

        const seller  =  await Seller.findOne({ userId : user_id})

        const account = await stripe.accounts.retrieve(seller.stripe_account_id);
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
            seller.is_verifed = true;
            seller.hasCompletedOnboarding = true;
            await seller.save();
            return res.status(200).json({ success : true,  response : response});
        }else {
            seller.is_verifed = false;
            seller.hasCompletedOnboarding = false;
            await seller.save();
            return res.status(200).json({ success : false,  response : response});
        }


    
      

    }catch(error){
        console.log(error);
        return res.status(400).json({  success : false, error : error.message });
    }
}
