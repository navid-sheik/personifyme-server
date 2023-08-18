

import User from "../models/user.js"; 
import  jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";
import logger from "../logger/index.js";
import RefreshToken from "../models/refresh-token.js";
import { sendEmail } from "../utils/sendEmail.js";
import Token from "../models/token.js";
import Stripe from 'stripe';
import * as userService from '../services/userServices.js';


export const likeProduct = async (req, res, next) => {
    try {
        const user_id = req.user;
        const product_id = req.params.id;
        const response = await userService.likeProduct(user_id, product_id);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(error)
        next(error);
    }
};

export const unlikeProduct = async (req, res, next) => {
    try {
        const user_id = req.user;
        const product_id = req.params.id;
        const response = await userService.unlikeProduct(user_id, product_id);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(error)
        next(error);
    }
};

export const getLikedProducts = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await userService.getLikedProducts(user_id);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(error)
        next(error);
    }
};