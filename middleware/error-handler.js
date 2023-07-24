import CustomError from "../errors/custom-error.js";
import logger from "../logger/index.js";



 
 //Middleware for handling errors
 const errorHandler = (err, req, res, next) => {

    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({ errors: err.serializeErrors() });
    }

    return res.status(500).json({ errors: [{ message: `Something wrong please check ${err.message}` }] });
};


export default errorHandler;