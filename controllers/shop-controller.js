import ShopService from '../services/shopServices.js';
import logger from '../logger/index.js';
import mongoose from 'mongoose';

export const createShop = async (req, res, next) => {
    try {
        const user_id = req.user;
        const data   =  req.body;
        const response = await ShopService.createShop(user_id, data);
        return res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

export const getShopBySeller = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await ShopService.getShopForSeller(user_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getShopProduct = async (req, res, next) => {
    try {
        const seller_id =  req.body.seller_id;
        const response = await ShopService.getShopProducts(seller_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getShopById = async (req, res, next) => {
    try {
        const shopId  =  req.params.id

        const response = await ShopService.getShopById(shopId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const updateShop = async (req, res, next) => {
    try {
        const user_id = req.user;
        const data = req.body;
        const response = await ShopService.updateShop(user_id, data);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const deactivateShop = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await ShopService.deactivateShop(user_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};
export const activateShop = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await ShopService.activateShop(user_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};


export const followShop = async (req, res, next) => {
    try {
        const user_id = req.user;
        const shop_id = req.params.id;
        const response = await ShopService.followShop(user_id, shop_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const unfollowShop = async (req, res, next) => {
    try {
        const user_id = req.user;
        const shop_id = req.params.id;
        const response = await ShopService.unfollowShop(user_id, shop_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getShopNumberItemSold = async (req, res, next) => {
    try {
        const seller_id = req.params.id;
        const response = await ShopService.getShopNumberItemSold( seller_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const checkShopPriviligies = async (req, res, next) => {
    try {
        const user_id  = req.user
        const shop_id = req.params.id;
        const response = await ShopService.checkShopPriviligies( user_id, shop_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

