import PaymentService from '../services/paymentServices.js';
import logger from '../logger/index.js';



export const getBalance = async (req, res, next) => {
    try {
        const user_id = req.user
        const response = await PaymentService.getBalance(user_id);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(error.message);
        next(error);
    }
};


export const getPaymentHistory = async (req, res, next) => {
    try {
        const user_id = req.user
        const response = await PaymentService.getPaymentHistory(user_id);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(error.message);
        next(error);
    }
};

export const getScheduledPayouts = async (req, res, next) => {
    try {
        const user_id = req.user
        const response = await PaymentService.getScheduledPayouts(user_id);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(error.message);
        next(error);
    }
};
