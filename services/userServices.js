// services/userService.js
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Buyer from "../models/buyer-account.js";
import jwt from 'jsonwebtoken';
import RefreshToken from "../models/refresh-token.js";
import { v4 as uuidv4 } from "uuid";
import CustomError from "../errors/custom-error.js";
import AuthError from "../errors/auth-error.js";
import { successResponse } from "../utils/response.js";
import Token from "../models/token.js";
import { sendEmail } from "../utils/sendEmail.js";


import { randomUUID } from "crypto"




export const signup = async (name , email, password, username) => {
    if (!name || !email || !password || !username) {
        throw new AuthError('Please provide all the required fields', 401);
    }
    let user  = await User.findOne({ email });
    if (user) {
        throw new AuthError('User already exists', 400);
    }

    user =  await User.create({ name, email, password, username });
    await user.save();



  
    //Generate token 
    const { token, refreshToken } = await generateToken(user);
    return  successResponse("Successfully signed up", { email : user.email, username : user.username , name :user.name, verified : user.verified,   token : token,  refreshToken: refreshToken });

};


export const login = async (email, password) => {
    if (!email || !password) {
        throw new AuthError('Please provide all the required fields', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new AuthError('Account doesn\'t exist, please go to login page ', 400);
    }
    const is_passowordMatch = await bcrypt.compare(password, user.password);
    if (!is_passowordMatch) {
        throw new AuthError('Invalid credentials', 400);
    }

    //Generate token
    const { token, refreshToken } = await generateToken(user);
    return  successResponse("Successfully logged in up", { email : user.email, username : user.username , name :user.name, verified : user.verified,   token : token,  refreshToken: refreshToken });
};



export const logout = async (used_id) => {
    await RefreshToken.findOneAndDelete({ user: used_id });
    return successResponse("Successfully logged out");
}



export const requestVerificationCode = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AuthError('Account doesn\'t exist, please go to login page ', 400);
    }
    const new_verification_token = await user.generateVerificationToken();
        // const verificationUrl = `http://localhost:3000/verify/${new_verification_token}`;
    await sendEmail({email : user.email, subject: "Email Verification", message : `This is your verification code ${new_verification_token}`});
    return  successResponse("Successfully sent email verification!", {email});
}



export const verifyEmail = async (verification_token, email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AuthError('Account doesn\'t exist, please go to login page ', 400);
    }
    const is_verified = user.validateVerificationToken(verification_token)
    if (!is_verified){
        throw new AuthError('Invalid verification code, request new one', 400);
       
    }
    const {token , refreshToken} = await generateToken(user);
    return  successResponse("Successfully logged in up", { email : user.email, username : user.username , name :user.name, verified : user.verified,   token : token,  refreshToken: refreshToken });



}

export const checkVerifedStatus  =  async (used_id) => {
     // Return the user's verified status
    const user = await User.findById({ used_id });
    if (!user) {
        throw new AuthError('Account doesn\'t exist, please go to login page ', 401);
    }
     if (!user.verified){
        //  Send first verification in order to verify the email
        const verification_token = await user.generateVerificationToken();

        // const verificationUrl = `${process.env.MOBILE_URL}/verify/${verification_token}`;
        await sendEmail({email : user.email, subject: "Email Verification", message : `This is your verification code ${verification_token}`});
        
        return  successResponse("Please verify your email", { email : user.email, verified : user.verified });
res
    }
}

export const sendToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AuthError('Please provide a refresh token', 401);
    }


    const refreshTokenDoc = await RefreshToken.findOne({ token: refreshToken });
    if (!refreshTokenDoc) {
        throw new AuthError('Invalid refresh token', 400);
    }

    if (refreshTokenDoc.expires < Date.now()) {
        throw new AuthError('Refresh token expired', 400);
    }
    const { token, refreshToken: newRefreshToken } = await generateToken(refreshTokenDoc.user);
    return  successResponse("Successfully sent new token", { token : token,  refreshToken: newRefreshToken });



}

export const sendPasswordLink = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AuthError('Account doesn\'t exist, please go to login page ', 400);
    }

    let token = await Token.findOne({userId : user._id})
    if (token){
        await token.deleteOne()
    }
    token = await new Token({userId : user._id, type : "reset-password",token : randomUUID()}).save()
    const url =  `${process.env.BASE_MOBILE_URL}password-reset/${user._id}/${token.token}`
    await  sendEmail({email : user.email, subject : "Reset Password", message :  url })
    return  successResponse("Successfully sent password reset link", { email : user.email });
}


export const verifiPasswordLink = async (id, existing_token) => {
        const user = await User.findById(id);
        if (!user) {
            throw new AuthError('Account doesn\'t exist, please go to login page ', 400);
        }
        const token  =  await Token.findOne({userId : user._id, token : existing_token})
        if (!token){
            throw new AuthError('Expired or invalid link, please try again', 400);
        }
        return  successResponse("Successfully verified password reset link", { email : user.email });
        
}




export const resetPassword = async (id,  password, existing_token) => {
    const user = await User.findById(id );
    if (!user) {
        throw new AuthError('Account doesn\'t exist, please go to login page ', 400);
    }
    const token  =  await Token.findOne({userId : user._id, token : existing_token})
    if (!token){
        throw new AuthError('Expired or invalid link, please try again', 400);
    }
    user.password = password
    await user.save()
    await  token.deleteOne()

    return  successResponse("Successfully Resetted password", { email : user.email });



}



//Helper functions

const generateToken = async(user) => {
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10h' });



    
    // Delete any existing refresh tokens for the user
    await RefreshToken.findOneAndDelete({ user: user._id})


    const refreshToken = new RefreshToken({
        user: user._id,
        token: uuidv4(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 1 week
    });

    await refreshToken.save();

    return { token, refreshToken: refreshToken.token };
}



export const getUserById = async (user_id) => {
    const user = await User.findById(user_id);
    if (!user) {
        throw new AuthError('User not found', 404);
    }
    return user;
}