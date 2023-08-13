import mongoose from "mongoose";
import CustomError from "../errors/custom-error.js";
import logger from "../logger/index.js";
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { errorResponse } from "../utils/response.js";
import AuthError from "../errors/auth-error.js";
import CategoryError from "../errors/category-error.js";
import ProductError from "../errors/product-error.js";
import ReviewError from "../errors/review-error.js";
import CartError from "../errors/cart-error.js";


 
 //Middleware for handling errors

 const errorHandler = (err, req, res, next) => {
    logger.error(err.message, err.stack)
    let message, statusCode , errorType;

    if (err instanceof AuthError) {
        statusCode = err.statusCode;
        message = err.message;
        errorType = "Auth Error"
    } else if (err instanceof CategoryError) {
        statusCode = err.statusCode;
        message = err.message;
        errorType = "Category Error"
    }
    else if (err instanceof CartError) {
        statusCode = err.statusCode;
        message = err.message;
        errorType = "Cart Error"
    }
    else if (err instanceof ProductError) {
        statusCode = err.statusCode;
        message = err.message;
        errorType = "Product Error"
    }
    else if (err instanceof ReviewError) {
        statusCode = err.statusCode;
        message = err.message;
        errorType = "Review Error"
    }
    else if (err instanceof CustomError) {
        statusCode = err.statusCode
        message = err.message;
        errorType = "Custom Error"
    }
    
    else if (err instanceof mongoose.Error.ValidationError ) {
        statusCode = 400
        message = err.message;
        errorType = "Database Error"

    }else if (err instanceof mongoose.Error.ValidatorError) {
        statusCode = 400
        message = err.message;
        errorType = "Database Error"
    }
    
    else  if (err instanceof mongoose.MongooseError) {
        statusCode = 400
        message = err.message;
        errorType = "Database Error"
    }else if (err instanceof jwt.TokenExpiredError) {
        statusCode = 401
        message = err.message;
        errorType = "JWT Auth Error"
    }else if (err instanceof jwt.JsonWebTokenError) {
        statusCode = 401
        message = err.message;
        errorType = "JWT Auth Error"
    }
    else if (err instanceof Stripe.errors.StripeError) {
        statusCode =  err.code || 400
        message = err.message;
        errorType = "Payment Error"
    }else {
        statusCode = 500
        message = err.message;
        errorType = "Server Error"
    }
    //     if (e.payment_intent.charges.data[0].outcome.type === 'blocked') {
    //         message =  'Payment blocked for suspected fraud.'
    //     } else if (e.code === 'card_declined') {
    //         message =  'Payment declined by the issuer.'
          
    //     } else if (e.code === 'expired_card') {
    //         message =  'Card expired.'
        
    //     } else {
    //         message =  'Other card error.Contact your bank card issuer.'
          
    //     }

    //     statusCode = 400
    //     errorType = "Payment Error"
    //   }
    
   
    
  

    let response  = errorResponse(message, statusCode, errorType);
    return  res.status(statusCode).json(response);
};


export default errorHandler;