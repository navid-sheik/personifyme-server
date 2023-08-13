import CartService from '../services/cartServices.js';
import logger from '../logger/index.js';

export const getCartByUser = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await CartService.getCart(user_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const addItemToCart = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await CartService.addToCart(user_id, req.body);
        return res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};



export const getCartItemById = async (req, res, next) => {
    try {
        const itemId = req.params.id;
        const response = await CartService.get(itemId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const updateCartItem = async (req, res, next) => {
    try {
        const user_id = req.user;
        const itemId = req.params.id;
        const response = await CartService.updateCartItem(user_id, itemId, req.body);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const deleteCartItem = async (req, res, next) => {
    try {
        const user_id = req.user;
        const itemId = req.params.id;
        const response = await CartService.removeFromCart(user_id, itemId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const clearCart = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await CartService.emptyCart(user_id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};