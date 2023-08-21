import * as userServices from '../services/userServices.js';
import logger from '../logger/index.js';

export const getUserById = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await userServices.getUserById(user_id)
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const updateUserById = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await userServices.updateUserById(user_id, req.body);
        return res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};


export const getSavedPaymentMethodsByUserId = async (req, res, next) => {
    try {
        const user_id = req.user;  // Assuming you store user ID in req.user
        
        // Retrieve saved payment methods
        const response = await userServices.getSavedPaymentMethods(user_id);
        
        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
};