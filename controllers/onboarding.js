//Create a custom onBoarding experience usnig Stripe Connect for a markeplace allowing the user to check if they are verified, update their details  and handle future or incominng requirements and verifications and all other edges case in express using restAPI pattern and MVC design pattern.

import logger from "../logger/index.js";
import Seller from "../models/seller-account.js";
import User from "../models/user.js";
import Stripe from 'stripe';
import * as onboardingServices from '../services/onBoardingServices.js';


//Create account Stripe Connect 

export const createConnectAccount = async (req, res, next) => {
    try{
        const {country } = req.body;
        const user_id  = req.user;
        let response  =  await  onboardingServices.createConnectedAccount(country, user_id);
        return res.status(201).json(response);

    }catch (error) {
        next(error);
    }
}



//Create account Link Stripe Connnect On Boarding 

export const requestOnBoardingLink  =  async (req, res, next) => {
   
    try{
        const user_id  = req.user;
        let response  =  await  onboardingServices.requestBoardingLink( user_id);
        return res.status(201).json(response);

    }catch(error){
       next(error)
    }
}


export const  refreshOnBoardingLink  =  async (req, res, next) => {
    try {
        const account_id   = req.params.account_id;
        let response  =  await  onboardingServices.refreshOnBoardingLink(account_id);
        return res.status(200).json(response);
    }catch(error){
       next(error)
    }
}

//Create account Link Stripe Connnect On Boarding 

export const updateOnBoardingLink  =  async (req, res, next) => {
    try{
        const user_id  = req.user;
        let response  =  await  onboardingServices.updateOnBoardingStatus(user_id);
        return res.status(200).json(response);
    }catch(error){
       next(error);
    }
}

export const checkVerificationStripe = async (req, res, next) => {
    try {
        const user_id  = req.user;
        let response  =  await  onboardingServices.checkVerificationStripe(user_id);
        return res.status(200).json(response);
 
    }catch(error){
        next(error)
    }
}
