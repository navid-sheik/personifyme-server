import OrderService from '../services/orderServices.js';
import logger from '../logger/index.js';

export const createOrder = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await OrderService.createOrder(user_id, req.body);
        return res.status(201).json(response);
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const response = await OrderService.getOrderById(orderId);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const getUserOrders = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await OrderService.getOrdersForUser(user_id);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const updateOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const user_id  =  req.user;
        const response = await OrderService.updateOrderItem(user_id, orderId, req.body);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const deleteOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const response = await OrderService.deleteOrder(orderId);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const successOrder = async (req, res, next) => {
    try{

        const user_id = req.user;
        const order_body =  req.body
        const response = await OrderService.successCheckout(user_id, order_body);
        return res.status(200).json(response);
    }catch(error) {
        logger.error(error);
        next(error);
    }
}


export const getOrderItemsForSeller = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await OrderService.getOrderItemsForSeller(user_id);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(error);
        next(error);
    }
}

export const getOrderItemsForUser = async (req, res, next) => {
    try {
        const user_id = req.user;
        const response = await OrderService.getOrderItemsForBuyers(user_id);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(error);
        next(error);
    }
}