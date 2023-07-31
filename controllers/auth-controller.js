
import User from "../models/user.js"; 
import  jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";
import logger from "../logger/index.js";
import RefreshToken from "../models/refresh-token.js";
import { sendEmail } from "../utils/sendEmail.js";
import Token from "../models/token.js";
import Stripe from 'stripe';
import * as userService from '../services/userServices.js';







export const signup = async (req, res, next) => {
    try{
        let { name, email, password, username } = req.body;
        const response  =  await userService.signup(name, email, password, username)
        //Sign up but not verified
        return res.status(202).json(response);

    }catch(error){

        next(error);
    }

}


export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const response =  await userService.login(email, password);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};


export const requestVerificationCode = async (req, res, next) => {
    try {
       const {email} = req.body
       const response  = await userService.requestVerificationCode(email)
       return res.status(200).json(response);
    }catch(error){
        next(error);
    }
}



export const verifyAccount = async (req, res, next) => {
    try {
        const {email, verification_token} = req.body
        const response  = await userService.verifyEmail(verification_token, email)
        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
}


export const checkVerifedStatus  =  async (req, res, next) => {
 
    try {
        const user_id = req.user
        const response = await userService.checkVerifedStatus(user_id)
        return res.status(200).json(response);

        
        
    } catch (error) {
        next(error);
    }
};



export const token = async (req, res, next) => {
  
    try {
        const refreshToken = req.body.refreshToken;
        const response = await userService.sendToken(refreshToken)
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};


export const sendPasswordResetLink = async (req, res, next) =>{
    try {

        const {email} = req.body
        const response  = await userService.sendPasswordLink(email)
        return res.status(200).json(response);
    } catch (error) {
        next(error)
    }
}

export const verifyPasswordResetLink = async (req, res, next) =>{
    try {
        const id = req.params.id
        const existing_token  = req.params.token
        console.log(id, existing_token);

        const response = await userService.verifiPasswordLink(id, existing_token)
        return res.status(200).json(response);

    } catch (error) {
        next(error)
        
    }

}

export const resetPassword = async (req, res, next) =>{
    try {
        const {password} = req.body
        const id = req.params.id
        const existing_token  = req.params.token
        const response = await userService.resetPassword(id, password, existing_token)
        return res.status(200).json(response);

    } catch (error) {
        next(error)
        
    }

}



export const logout = async (req, res, next) => {
    //Protected route 
    try {
        const user_id = req.user;
        const response = await userService.logout(user_id)
        return res.status(200).json(response);
    } catch (error) {
        next(error);
        
    }
};



export  const protectedRoute = async (req, res, next) => {
    try {

        console.log("somethin");
        const user = await User.findById(req.user.userId).select('-password');
        return res.json({ user });
    } catch (error) {
        console.log(error.message);
        logger.error('Something wrong in protected route controller');
        next(error);
    }
}