import mongoose from "mongoose";
import CustomError from "../errors/custom-error.js";
import logger from "../logger/index.js";



 
 //Middleware for handling errors
 const errorHandler = (err, req, res, next) => {

    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({ errors: err.serializeErrors() });
    }
    if (err instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({ errors: messages });
    }

    if (err instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({ errors: messages });
    }
    
    if (err instanceof jwt.JsonWebTokenError) {
        return res.status(400).json({ errors : [{ message: 'Error in token generation' }] });
    }



    return res.status(500).json({ errors: [{ message: `Something wrong please check ${err.message}` }] });
};


export default errorHandler;