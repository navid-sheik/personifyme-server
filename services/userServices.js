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
import Product from "../models/product.js";
import ProductError from "../errors/product-error.js";
import Shop from "../models/shop.js";
import mongoose from "mongoose";
import logger from "../logger/index.js";
import { uploadImage } from "../utils/cloudinary.js";
import Stripe from 'stripe';
const stripe = new Stripe( 'sk_test_51NYyrYB6nvvF5XehM7BqvJEdp9EWjsW0AnC24pdrSOWgUAeM3MEFB7sonWa0CHfVp3d7FkXwaZhHvfj1QzyEqdYJ00nmz013nW');







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


    //Create  a new empty cart
    //Create new stripe customer object 
    const customer = await stripe.customers.create({
        email: user.email,
        name: user.name
    });
    user.stripe_customer_id = customer.id;  // Assuming you have a stripeCustomerId field in your User schema
    await user.save();


    //Generate token 
    const { token, refreshToken } = await generateToken(user);
    return  successResponse("Successfully signed up", { seller_id: user.seller_id,  user_id: user._id,  email : user.email, username : user.username , name :user.name, verified : user.verified,   token : token,  refreshToken: refreshToken });

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
    return  successResponse("Successfully logged in up", { seller_id: user.seller_id, user_id: user._id,  email : user.email, username : user.username , name :user.name, verified : user.verified,   token : token,  refreshToken: refreshToken });
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
    return  successResponse("Successfully logged in up", { seller_id: user.seller_id, user_id: user._id, email : user.email, username : user.username , name :user.name, verified : user.verified,   token : token,  refreshToken: refreshToken });



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
        
        return  successResponse("Please verify your email", { seller_id: user.seller_id, user_id: user._id, email : user.email, verified : user.verified });
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
    return successResponse("Successfully retrieved user",  user );
}
export const updateUserById = async (user_id, updateData) => {
        const imageString = updateData.image;

        
        if (imageString && isBase64(imageString)) {
            // If shop.image is not empty and not a URL, then upload it
            try {
                const newImageUrl = await uploadImage(imageString, 'user_images', user_id.toString());
                // After the image is uploaded, set the shop.image field with the new URL
                console.log('Uploaded image for users:', newImageUrl);
                updateData.image = newImageUrl;
            } catch (error) {
                logger.error(error);
                console.error('Error uploading image:', error.message);
                throw new AuthError('Failed to upload image', 500);
            }
        }

        const user = await User.findByIdAndUpdate(user_id, updateData, { new: true });
        
        // Check if the user exists
        if (!user) {
            throw new AuthError('User not found', 404);
        }

        // Return success response
        return successResponse("Successfully updated user", user);
     
}




export const likeProduct = async (user_id, product_id) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(user_id);
        if (!user) {
            throw new AuthError('User not found');
        }

        const product = await Product.findById(product_id).populate({
            path: 'seller_id',
            model: 'Seller',
            populate: {
                path: 'shopId',
                model: 'Shop',
            },
        });

        if (!product) {
            throw new ProductError('Product not found', 404);
        }

        if (user.likes.includes(product_id)) {
            throw new ProductError('Product already liked', 409); // 409 Conflict
        }

        user.likes.push(product_id);
        await user.save({ session });

        // Calling separate function to handle shop like increment
        await incrementShopLikes(product.seller_id.shopId);

        await session.commitTransaction();

        return successResponse('Successfully liked product', product_id);

    } catch (error) {
        await session.abortTransaction();
        console.error('Transaction aborted due to: ', error);
        throw error; // This error should be caught by an outer error handler (e.g., middleware in Express) to send an appropriate response to the client.
    } finally {
        session.endSession();
    }
};

const incrementShopLikes = async (shopId) => {
    try {
        // Atomic increment of likes by 1
        await Shop.findByIdAndUpdate(shopId, { $inc: { totalLikes : 1 } });
    } catch (error) {
        console.error('Failed to increment shop likes: ', error);
        throw new Error('Failed to update shop likes');
    }
};





export const unlikeProduct = async (user_id, product_id) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(user_id);
        if (!user) {
            throw new AuthError('User not found', 404);
        }

        const product = await Product.findById(product_id).populate({
            path: 'seller_id',
            model: 'Seller',
            populate: {
                path: 'shopId',
                model: 'Shop',
            },
        });

        if (!product) {
            throw new ProductError('Product not found', 404);
        }

        if (!user.likes.includes(product_id)) {
            throw new ProductError('Product not liked by user', 409); // 409 Conflict
        }

        user.likes = user.likes.filter((id) => id.toString() !== product_id.toString());
        await user.save({ session });

        // Calling separate function to handle shop like decrement
        await decrementShopLikes(product.seller_id.shopId);

        await session.commitTransaction();

        return successResponse('Successfully unliked product', product_id);

    } catch (error) {
        await session.abortTransaction();
        console.error('Transaction aborted due to: ', error);
        throw error; // This error should be caught by an outer error handler (e.g., middleware in Express) to send an appropriate response to the client.
    } finally {
        session.endSession();
    }
};

const decrementShopLikes = async (shopId) => {
    try {
        // Atomic decrement of likes by 1
        await Shop.findByIdAndUpdate(shopId, { $inc: { totalLikes: -1 } });
    } catch (error) {
        console.error('Failed to decrement shop likes: ', error);
        throw new Error('Failed to update shop likes');
    }
};


export const getLikedProducts = async (user_id) => {
    if (!user_id){
        throw new AuthError('User not found', 404);
    }

    let user = await User.findById(user_id).populate('likes');
    if (!user){
        throw new AuthError('User not found', 404);
    }

    // Return only likes products arrays
    if (!user.likes){
        return successResponse("Successfully fetched liked products", []);
    }

    let likes = user.likes.map((product) => product._id);

    return successResponse("Successfully fetched liked products", user.likes);
}




export const getSavedPaymentMethods = async (user_id) => {
    // Retrieve the user from your database
    const user = await User.findById(user_id);
    if (!user) {
        throw new AuthError('User not found', 404);
    }

    // Make sure the user has a Stripe customer ID
    if (!user.stripe_customer_id) {
        throw new AuthError('Stripe customer not found for this user', 404);
    }

    // Fetch saved payment methods from Stripe
    try {
        const paymentMethods = await stripe.paymentMethods.list({
            customer: user.stripe_customer_id,
            type: 'card',  // Replace with the type of payment method you want to fetch
        });

        return successResponse("Successfully retrieved payment methods", paymentMethods.data);

    } catch (error) {
        // Handle Stripe errors or any other errors
        throw new AuthError('Failed to retrieve payment methods', 400);
    }
}







function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch (err) {
        return false;
    }
}
function isBase64(str) {
    try {
      // Check if the string has the base64 format: data:image/[type];base64,[data]
      return Boolean(str.match(/^data:image\/([a-zA-Z]+);base64,/));
    } catch (err) {
      return false;
    }
  }


  